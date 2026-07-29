import { describe, expect, it } from "vitest";
import { createHealthDataSchema } from "@/lib/validation/health-data";

describe("createHealthDataSchema", () => {
  it("accepts valid input", () => {
    const result = createHealthDataSchema.safeParse({
      originalUrl: "https://example.com/report.pdf",
      sourceType: "PDF",
      notes: "Patient blood report",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = createHealthDataSchema.safeParse({
      originalUrl: "not-a-url",
      sourceType: "PDF",
    });
    expect(result.success).toBe(false);
  });
});
