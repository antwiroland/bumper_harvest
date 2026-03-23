import { requireAdmin } from "@/lib/auth-utils";
import { errorResponse, successResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors/app-error";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { analyticsService, AnalyticsServiceError } from "@/lib/services/analytics.service";
import { analyticsPeriodSchema } from "@/lib/validations/analytics";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const parsed = analyticsPeriodSchema.safeParse(url.searchParams.get("period") ?? undefined);

    if (!parsed.success) {
      return errorResponse("Invalid period", {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const revenue = await analyticsService.getRevenueAnalytics(parsed.data);
    return successResponse(revenue);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return handleApiError(new AppError(error.message, error.code, 400));
    }
    return handleApiError(error);
  }
}
