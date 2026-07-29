import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit/log";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

export async function GET() {
  const session = await getServerSession(authOptions);
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for");
  const ua = hdrs.get("user-agent");

  if (!session?.user?.email) {
    await writeAuditLog({
      action: AuditAction.DATA_ACCESS,
      resource: "user_profile",
      metadata: { authorized: false },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await writeAuditLog({
    userId: user.id,
    action: AuditAction.DATA_ACCESS,
    resource: "user_profile",
    resourceId: user.id,
    metadata: { authorized: true },
    ipAddress: ip,
    userAgent: ua,
  });

  return NextResponse.json({ ok: true, user });
}
