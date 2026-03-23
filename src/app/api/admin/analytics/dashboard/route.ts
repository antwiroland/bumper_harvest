import { requireAdmin } from "@/lib/auth-utils";
import { successResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors/app-error";
import { handleApiError } from "@/lib/errors/handle-api-error";
import { analyticsService, AnalyticsServiceError } from "@/lib/services/analytics.service";

export async function GET() {
  try {
    await requireAdmin();
    const [dashboard, settlementStats, topPackages] = await Promise.all([
      analyticsService.getDashboardStats(),
      analyticsService.getSettlementStats(),
      analyticsService.getTopPerformingPackages(),
    ]);

    return successResponse({
      dashboard,
      settlementStats,
      topPackages,
    });
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return handleApiError(new AppError(error.message, error.code, 400));
    }
    return handleApiError(error);
  }
}
