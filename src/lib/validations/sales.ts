import { z } from "zod";

export const salesIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");

export const salesQuerySchema = z.object({
  purchaseId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid purchase id")
    .optional(),
});

export const updateSalesSchema = z.object({
  soldQuantity: z.number().int().min(0, "Sold quantity cannot be negative"),
});

export const bulkUpdateSalesSchema = z.object({
  updates: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid product id"),
        soldQuantity: z.number().int().min(0, "Sold quantity cannot be negative"),
      }),
    )
    .min(1, "At least one update is required"),
});

export type UpdateSalesInput = z.infer<typeof updateSalesSchema>;
export type BulkUpdateSalesInput = z.infer<typeof bulkUpdateSalesSchema>;
