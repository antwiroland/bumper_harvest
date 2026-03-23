import { logger } from "@/lib/errors/logger";

type AuditContext = Record<string, unknown>;

export function auditLog(action: string, context: AuditContext = {}) {
  logger.info(`[AUDIT] ${action}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}
