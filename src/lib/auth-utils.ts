import type { Role } from "@prisma/client";

import { auth } from "@/lib/auth";

type AuthenticatedUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: Role;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== "USER") {
    throw new Error("Forbidden");
  }
  return user;
}
