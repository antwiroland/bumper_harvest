import { PaymentType } from "@prisma/client";
import { z } from "zod";

const amountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(10_000_000, "Amount is too large");

export const initializePaymentSchema = z.object({
  amount: amountSchema,
  type: z.nativeEnum(PaymentType),
  provider: z.enum(["paystack", "flutterwave"]).default("paystack"),
  callbackUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().trim().min(3).max(120),
});

export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
