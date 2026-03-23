import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth-utils";
import { comparePassword, hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/security/audit-log";
import { sanitizeInput } from "@/lib/security/sanitize-input";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export async function PUT(request: Request) {
  try {
    const authUser = await requireAuth();
    const body = sanitizeInput(await request.json());
    const parsed = updatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentMatches = await comparePassword(parsed.data.currentPassword, user.password);
    if (!currentMatches) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 },
      );
    }

    const nextPassword = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: nextPassword },
    });
    auditLog("user.password.updated", { userId: user.id });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
