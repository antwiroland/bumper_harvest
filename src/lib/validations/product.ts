import { z } from "zod";

export const productIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid product id");

export const createProductSchema = z.object({
  packageId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid package id"),
  name: z.string().trim().min(2).max(120),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
  costPrice: z.number().positive("Cost price must be greater than zero"),
  sellingPrice: z.number().positive("Selling price must be greater than zero"),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    quantity: z.number().int().positive("Quantity must be greater than zero").optional(),
    costPrice: z.number().positive("Cost price must be greater than zero").optional(),
    sellingPrice: z.number().positive("Selling price must be greater than zero").optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const productQuerySchema = z.object({
  packageId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid package id")
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
