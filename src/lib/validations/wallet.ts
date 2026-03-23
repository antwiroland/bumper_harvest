import { TransactionType } from "@prisma/client";
import { z } from "zod";

const amountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(10_000_000, "Amount is too large");

export const depositSchema = z.object({
  amount: amountSchema,
  description: z.string().trim().min(3).max(255).optional(),
  reference: z.string().trim().min(3).max(120).optional(),
});

export const withdrawalSchema = z.object({
  amount: amountSchema,
  accountName: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().min(6).max(30),
  bankName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(3).max(255).optional(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.nativeEnum(TransactionType).optional(),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
