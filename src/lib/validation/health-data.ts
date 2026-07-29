import { z } from "zod";

export const createHealthDataSchema = z.object({
  originalUrl: z.string().url().max(2048),
  sourceType: z.enum(["PDF", "IMAGE", "TEXT"]).default("PDF"),
  notes: z.string().max(2000).optional(),
});

export type CreateHealthDataInput = z.infer<typeof createHealthDataSchema>;
