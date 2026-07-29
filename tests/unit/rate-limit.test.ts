import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("rate limiter", () => {
  it("limits requests over threshold", async () => {
    const key = `test-key-${Date.now()}`;
    const limit = 3;

    const r1 = await checkRateLimit({ key, limit, windowMs: 60_000 });
    const r2 = await checkRateLimit({ key, limit, windowMs: 60_000 });
    const r3 = await checkRateLimit({ key, limit, windowMs: 60_000 });
    const r4 = await checkRateLimit({ key, limit, windowMs: 60_000 });

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r4.allowed).toBe(false);
  });
});
