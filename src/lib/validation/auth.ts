import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
  name: z.string().min(2).max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
