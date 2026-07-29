import { describe, expect, it } from "vitest";
import { parseHealthDocument } from "@/lib/parsers/health-parser";

describe("parseHealthDocument", () => {
  it("returns deterministic scaffold output", async () => {
    const output = await parseHealthDocument({
      originalUrl: "https://example.com/report.pdf",
      sourceType: "PDF",
      notes: "test",
    });

    expect(output.summary).toBeTypeOf("string");
    expect(output.extractedFields.sourceUrl).toBe("https://example.com/report.pdf");
    expect(output.confidence).toBeGreaterThanOrEqual(0);
    expect(output.confidence).toBeLessThanOrEqual(1);
  });
});
