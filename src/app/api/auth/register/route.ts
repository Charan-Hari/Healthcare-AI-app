import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { writeAuditLog } from "@/lib/audit/log";
import { AuditAction } from "@prisma/client";
import { withApiHandler } from "@/lib/http/api-handler";
import { handleOptions } from "@/lib/http/security";
import { registerSchema } from "@/modules/auth/auth.schema";
import type { RegisterInput } from "@/modules/auth/auth.schema";
import { AuthService } from "@/modules/auth/auth.service";

const authService = new AuthService();

export const POST = withApiHandler(async ({ req, requestId, ipAddress, userAgent }) => {
  const ipKey = ipAddress || "unknown";
  const rl = await checkRateLimit({ key: `register:${ipKey}`, windowMs: 60_000, limit: 10 });

  if (!rl.allowed) {
    logger.warn({ requestId, ipAddress }, "Register rate limit exceeded");
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  const input: RegisterInput = parsed.data;
  const result = await authService.register(input);

  if (!result.ok) {
    await writeAuditLog({
      action: AuditAction.AUTH_REGISTER_FAILED,
      resource: "auth_register",
      metadata: { reason: "already_exists", email: parsed.data.email.toLowerCase() },
      ipAddress,
      userAgent,
      requestId,
    });

    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  await writeAuditLog({
    userId: result.user.id,
    action: AuditAction.AUTH_REGISTER_SUCCESS,
    resource: "auth_register",
    resourceId: result.user.id,
    metadata: { email: result.user.email },
    ipAddress,
    userAgent,
    requestId,
  });

  logger.info({ requestId, userId: result.user.id }, "User registered");
  return NextResponse.json({ ok: true, user: result.user }, { status: 201 });
});

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}
