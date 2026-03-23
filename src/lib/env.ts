import { z } from "zod";

import { logger } from "@/lib/errors/logger";

const globalForEnvAudit = globalThis as unknown as {
  __envAuditLogged?: boolean;
};

const envAuditSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  DATABASE_URL: z.string().url().optional(),
});

export function auditEnvironment() {
  if (globalForEnvAudit.__envAuditLogged) {
    return;
  }

  const parsed = envAuditSchema.safeParse(process.env);
  if (!parsed.success) {
    logger.warn("Environment audit warnings", parsed.error.flatten());
    globalForEnvAudit.__envAuditLogged = true;
    return;
  }

  const env = parsed.data;
  if (env.NODE_ENV === "production" && !env.NEXTAUTH_SECRET) {
    logger.warn("NEXTAUTH_SECRET is missing in production");
  }
  if (env.DATABASE_URL && !env.DATABASE_URL.includes("maxPoolSize")) {
    logger.warn("DATABASE_URL does not include maxPoolSize for MongoDB pooling");
  }
  if (env.DATABASE_URL?.startsWith("mongodb")) {
    const mongoUrl = new URL(env.DATABASE_URL);
    if (mongoUrl.pathname === "/" || mongoUrl.pathname.trim() === "") {
      logger.warn("DATABASE_URL does not include a MongoDB database name");
    }
  }

  globalForEnvAudit.__envAuditLogged = true;
}
