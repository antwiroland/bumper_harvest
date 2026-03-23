import { PurchaseStatus } from "@prisma/client";
import { z } from "zod";

export const purchaseIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid purchase id");

export const createPurchaseSchema = z.object({
  packageId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid package id"),
});

export const purchaseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(PurchaseStatus).optional(),
  userId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid user id")
    .optional(),
  packageId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid package id")
    .optional(),
  activeOnly: z.coerce.boolean().optional().default(false),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
