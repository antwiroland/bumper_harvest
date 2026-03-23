import { z } from "zod";

export const packageIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid package id");

export const createPackageSchema = z.object({
  categoryId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid category id"),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().url("Invalid image URL").optional(),
  isActive: z.boolean().optional(),
});

export const updatePackageSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    imageUrl: z.string().trim().url("Invalid image URL").optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const packageQuerySchema = z.object({
  categoryId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid category id")
    .optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
});

export const createProductInPackageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
  costPrice: z.number().positive("Cost price must be greater than zero"),
  sellingPrice: z.number().positive("Selling price must be greater than zero"),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageQueryInput = z.infer<typeof packageQuerySchema>;
export type CreateProductInPackageInput = z.infer<typeof createProductInPackageSchema>;
