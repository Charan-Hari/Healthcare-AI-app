import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/http/request-id";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { writeAuditLog } from "@/lib/audit/log";
import { AuditAction } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  const { requestId, ipAddress, userAgent } = await getRequestContext();
  const ipKey = ipAddress || "unknown";
  const rl = checkRateLimit({ key: `login:${ipKey}`, windowMs: 60_000, limit: 20 });

  if (!rl.allowed) {
    logger.warn({ requestId, ipAddress }, "Login rate limit exceeded");
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      await writeAuditLog({
        action: AuditAction.AUTH_LOGIN_FAILED,
        resource: "auth_login",
        metadata: { reason: "validation_failed" },
        ipAddress,
        userAgent,
        requestId,
      });

      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await writeAuditLog({
        action: AuditAction.AUTH_LOGIN_FAILED,
        resource: "auth_login",
        metadata: { reason: "user_not_found", email },
        ipAddress,
        userAgent,
        requestId,
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      await writeAuditLog({
        userId: user.id,
        action: AuditAction.AUTH_LOGIN_FAILED,
        resource: "auth_login",
        resourceId: user.id,
        metadata: { reason: "bad_password" },
        ipAddress,
        userAgent,
        requestId,
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await writeAuditLog({
      userId: user.id,
      action: AuditAction.AUTH_LOGIN_SUCCESS,
      resource: "auth_login",
      resourceId: user.id,
      metadata: { email: user.email },
      ipAddress,
      userAgent,
      requestId,
    });

    logger.info({ requestId, userId: user.id }, "User login success");
    return NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email, name: user.name } },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ requestId, err: error }, "Login error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
