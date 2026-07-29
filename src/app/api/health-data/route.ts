import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit/log";
import { AuditAction, HealthDataStatus } from "@prisma/client";
import { createHealthDataSchema } from "@/lib/validation/health-data";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for");
  const ua = hdrs.get("user-agent");

  if (!session?.user?.email) {
    await writeAuditLog({
      action: AuditAction.DATA_UPLOAD,
      resource: "health_data",
      metadata: { authorized: false },
      ipAddress: ip,
      userAgent: ua,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createHealthDataSchema.safeParse(body);

    if (!parsed.success) {
      await writeAuditLog({
        action: AuditAction.DATA_UPLOAD,
        resource: "health_data",
        metadata: {
          authorized: true,
          validationFailed: true,
          issues: parsed.error.issues.map((i) => i.message),
        },
        ipAddress: ip,
        userAgent: ua,
      });

      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const record = await prisma.healthDataRecord.create({
      data: {
        userId: user.id,
        originalUrl: parsed.data.originalUrl,
        status: HealthDataStatus.PENDING,
        parsedJson: {
          sourceType: parsed.data.sourceType,
          notes: parsed.data.notes ?? null,
        },
      },
      select: { id: true, userId: true, originalUrl: true, status: true, createdAt: true },
    });

    // Fire-and-forget parse task
    await tasks.trigger("parse-health-data", {
      recordId: record.id,
      userId: user.id,
    });

    await writeAuditLog({
      userId: user.id,
      action: AuditAction.DATA_UPLOAD,
      resource: "health_data",
      resourceId: record.id,
      metadata: { sourceType: parsed.data.sourceType, queuedForParsing: true },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({ ok: true, record, queued: true }, { status: 201 });
  } catch (error) {
    console.error("Health data upload error:", error);

    await writeAuditLog({
      action: AuditAction.DATA_UPLOAD,
      resource: "health_data",
      metadata: { internalError: true },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const records = await prisma.healthDataRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
      parsedJson: true,
    },
    take: 100,
  });

  return NextResponse.json({ ok: true, records }, { status: 200 });
}
