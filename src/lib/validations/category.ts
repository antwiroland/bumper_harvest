import { z } from "zod";

const positiveAmount = z
  .number({ invalid_type_error: "Value must be a number" })
  .positive("Value must be greater than zero")
  .max(10_000_000, "Value is too large");

export const categoryIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid category id");

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  packagePrice: positiveAmount,
  subscriptionFee: positiveAmount,
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const categoryQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional().default(false),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
