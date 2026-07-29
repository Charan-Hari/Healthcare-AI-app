import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/http/api-handler";
import { handleOptions } from "@/lib/http/security";

export const GET = withApiHandler(async () => {
  return NextResponse.json({ ok: true, service: "healthcare-ai-app" });
});

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}
