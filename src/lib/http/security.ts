import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function applySecurityHeaders(
  req: NextRequest,
  res: NextResponse,
  options?: { allowMethods?: string; allowHeaders?: string }
): NextResponse {
  const origin = req.headers.get("origin");
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Basic CORS
  res.headers.set("Access-Control-Allow-Origin", allowOrigin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", options?.allowMethods ?? "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", options?.allowHeaders ?? "Content-Type, Authorization, X-Request-Id");
  res.headers.set("Access-Control-Allow-Credentials", "true");

  // Security headers
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Cross-Origin-Resource-Policy", "same-site");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return res;
}

export function handleOptions(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  return applySecurityHeaders(req, res);
}
