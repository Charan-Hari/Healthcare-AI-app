import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/http/request-id";
import { applySecurityHeaders } from "@/lib/http/security";

type Handler = (ctx: {
  req: NextRequest;
  requestId: string;
  ipAddress: string | null;
  userAgent: string | null;
}) => Promise<NextResponse>;

export function withApiHandler(handler: Handler) {
  return async function wrapped(req: NextRequest): Promise<NextResponse> {
    const { requestId, ipAddress, userAgent } = await getRequestContext(req);

    try {
      const res = await handler({ req, requestId, ipAddress, userAgent });
      res.headers.set("X-Request-Id", requestId);
      return applySecurityHeaders(req, res);
    } catch (error) {
      logger.error({ requestId, ipAddress, userAgent, err: error }, "Unhandled API error");
      const res = NextResponse.json(
        { error: "Internal server error", requestId },
        { status: 500 }
      );
      res.headers.set("X-Request-Id", requestId);
      return applySecurityHeaders(req, res);
    }
  };
}
