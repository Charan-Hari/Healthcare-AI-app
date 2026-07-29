export type ParseResult = {
  summary: string;
  extractedFields: Record<string, unknown>;
  confidence: number;
};

export async function parseHealthDocument(input: {
  originalUrl: string;
  sourceType?: string;
  notes?: string | null;
}): Promise<ParseResult> {
  // TODO: Replace with real parser pipeline (PDF -> OCR/vision -> LLM extraction)
  // Keep this deterministic and safe for now.
  return {
    summary: "Document parsing scaffold completed.",
    extractedFields: {
      sourceUrl: input.originalUrl,
      sourceType: input.sourceType ?? "UNKNOWN",
      notesPresent: Boolean(input.notes),
      processedAt: new Date().toISOString(),
    },
    confidence: 0.5,
  };
}
