import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { writeAuditLog } from "@/lib/audit/log";
import { AuditAction } from "@prisma/client";
import { withApiHandler } from "@/lib/http/api-handler";
import { handleOptions } from "@/lib/http/security";
import { loginSchema } from "@/modules/auth/login.schema";
import type { LoginInput } from "@/modules/auth/login.schema";
import { LoginService } from "@/modules/auth/login.service";

const loginService = new LoginService();

export const POST = withApiHandler(async ({ req, requestId, ipAddress, userAgent }) => {
  const ipKey = ipAddress || "unknown";
  const rl = await checkRateLimit({ key: `login:${ipKey}`, windowMs: 60_000, limit: 20 });

  if (!rl.allowed) {
    logger.warn({ requestId, ipAddress }, "Login rate limit exceeded");
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  const input: LoginInput = parsed.data;
  const result = await loginService.login(input);

  if (!result.ok) {
    await writeAuditLog({
      userId: "userId" in result ? result.userId : undefined,
      action: AuditAction.AUTH_LOGIN_FAILED,
      resource: "auth_login",
      metadata: { reason: result.code, email: parsed.data.email.toLowerCase() },
      ipAddress,
      userAgent,
      requestId,
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await writeAuditLog({
    userId: result.user.id,
    action: AuditAction.AUTH_LOGIN_SUCCESS,
    resource: "auth_login",
    resourceId: result.user.id,
    metadata: { email: result.user.email },
    ipAddress,
    userAgent,
    requestId,
  });

  logger.info({ requestId, userId: result.user.id }, "User login success");
  return NextResponse.json({ ok: true, user: result.user }, { status: 200 });
});

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}
