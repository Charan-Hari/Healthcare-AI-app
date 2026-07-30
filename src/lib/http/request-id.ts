import { headers as nextHeaders } from "next/headers";
import crypto from "crypto";

export async function getRequestContext(req?: Request) {
  let requestId: string | null = null;
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  try {
    const hdrs = await nextHeaders();
    requestId = hdrs.get("x-request-id");
    ipAddress = hdrs.get("x-forwarded-for");
    userAgent = hdrs.get("user-agent");
  } catch {
    // Outside Next request scope (e.g., tests)
    if (req) {
      requestId = req.headers.get("x-request-id");
      ipAddress = req.headers.get("x-forwarded-for");
      userAgent = req.headers.get("user-agent");
    }
  }

  return {
    requestId: requestId || crypto.randomUUID(),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  };
}
