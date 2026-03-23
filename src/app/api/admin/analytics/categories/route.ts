import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { analyticsService, AnalyticsServiceError } from "@/lib/services/analytics.service";

export async function GET() {
  try {
    await requireAdmin();
    const [categories, topPackages] = await Promise.all([
      analyticsService.getCategoryPerformance(),
      analyticsService.getTopPerformingPackages(10),
    ]);

    return NextResponse.json({
      categories,
      topPackages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof AnalyticsServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
