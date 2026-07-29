import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/http/request-id";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { writeAuditLog } from "@/lib/audit/log";
import { AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { requestId, ipAddress, userAgent } = await getRequestContext();
  const ipKey = ipAddress || "unknown";
  const rl = checkRateLimit({ key: `register:${ipKey}`, windowMs: 60_000, limit: 10 });

  if (!rl.allowed) {
    logger.warn({ requestId, ipAddress }, "Register rate limit exceeded");
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      await writeAuditLog({
        action: AuditAction.AUTH_REGISTER_FAILED,
        resource: "auth_register",
        metadata: { reason: "validation_failed" },
        ipAddress,
        userAgent,
        requestId,
      });

      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      await writeAuditLog({
        action: AuditAction.AUTH_REGISTER_FAILED,
        resource: "auth_register",
        metadata: { reason: "already_exists", email: normalizedEmail },
        ipAddress,
        userAgent,
        requestId,
      });

      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, name: name?.trim() },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    await writeAuditLog({
      userId: user.id,
      action: AuditAction.AUTH_REGISTER_SUCCESS,
      resource: "auth_register",
      resourceId: user.id,
      metadata: { email: user.email },
      ipAddress,
      userAgent,
      requestId,
    });

    logger.info({ requestId, userId: user.id }, "User registered");
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    logger.error({ requestId, err: error }, "Register error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
