import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/errors/logger";
import { errorResponse } from "@/lib/api-response";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    logger.warn(error.message, {
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    });
    return errorResponse(error.message, {
      status: error.statusCode,
      code: error.code,
      details: error.details,
    });
  }

  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", { status: 401 });
    }
    if (error.message === "Forbidden") {
      return errorResponse("Forbidden", { status: 403 });
    }
    logger.error(error.message);
  } else {
    logger.error("Unknown API error", {
      error,
    });
  }

  return errorResponse("Internal server error", { status: 500 });
}
