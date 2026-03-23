import { z } from "zod";

export const subscriptionIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid subscription id");

export const subscribeSchema = z.object({
  categoryId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid category id"),
});

export const checkSubscriptionSchema = z.object({
  categoryId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid category id"),
  userId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid user id")
    .optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type CheckSubscriptionInput = z.infer<typeof checkSubscriptionSchema>;
