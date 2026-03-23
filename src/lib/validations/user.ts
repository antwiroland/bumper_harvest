import { Role } from "@prisma/client";
import { z } from "zod";

export const userIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user id");

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(Role).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
