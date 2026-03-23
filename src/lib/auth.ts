import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { comparePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/errors/logger";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const failedLoginAttempts = new Map<string, { count: number; lastAttemptAt: number }>();

function isLockedOut(email: string): boolean {
  const entry = failedLoginAttempts.get(email);
  if (!entry) return false;
  const elapsed = Date.now() - entry.lastAttemptAt;
  if (elapsed > LOCKOUT_WINDOW_MS) {
    failedLoginAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function trackFailedAttempt(email: string) {
  const current = failedLoginAttempts.get(email);
  const now = Date.now();
  if (!current || now - current.lastAttemptAt > LOCKOUT_WINDOW_MS) {
    failedLoginAttempts.set(email, { count: 1, lastAttemptAt: now });
    return;
  }
  failedLoginAttempts.set(email, { count: current.count + 1, lastAttemptAt: now });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 12,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase().trim();
        if (isLockedOut(email)) {
          logger.warn("Locked out login attempt", { email });
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          trackFailedAttempt(email);
          return null;
        }

        const validPassword = await comparePassword(parsed.data.password, user.password);
        if (!validPassword) {
          trackFailedAttempt(email);
          return null;
        }

        failedLoginAttempts.delete(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role | undefined) ?? "USER";
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
