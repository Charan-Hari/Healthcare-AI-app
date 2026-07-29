import { headers } from "next/headers";
import crypto from "crypto";

export async function getRequestContext() {
  const hdrs = await headers();
  const requestId = hdrs.get("x-request-id") || crypto.randomUUID();
  const ipAddress = hdrs.get("x-forwarded-for");
  const userAgent = hdrs.get("user-agent");
  return { requestId, ipAddress, userAgent };
}
