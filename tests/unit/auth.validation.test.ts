import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/validation/auth";

describe("registerSchema", () => {
  it("accepts valid payload", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "StrongPass#1234",
      name: "User Name",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "weak",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "bad-email",
      password: "StrongPass#1234",
    });
    expect(result.success).toBe(false);
  });
});
