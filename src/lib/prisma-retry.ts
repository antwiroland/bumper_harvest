import { Prisma } from "@prisma/client";

const RETRYABLE_CODE = "P2010";
const RETRYABLE_MESSAGE_PARTS = [
  "forcibly closed by the remote host",
  "RetryableWriteError",
  "TransientTransactionError",
  "Connection pool",
  "I/O error",
];

function isRetryablePrismaError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== RETRYABLE_CODE) {
    return false;
  }

  const message = String(error.message ?? "");
  return RETRYABLE_MESSAGE_PARTS.some((part) => message.includes(part));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withPrismaRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryablePrismaError(error) || attempt === attempts) {
        throw error;
      }

      const delayMs = 150 * attempt;
      await sleep(delayMs);
    }
  }

  throw lastError;
}
