import { Suspense } from "react";
import { unstable_cache } from "next/cache";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { CategoryPerformance } from "@/components/admin/category-performance";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatsOverview } from "@/components/admin/stats-overview";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { analyticsService } from "@/lib/services/analytics.service";

const getCachedDashboardStats = unstable_cache(
  async () => analyticsService.getDashboardStats(),
  ["admin-dashboard-stats"],
  { revalidate: 60 },
);

const getCachedCategoryPerformance = unstable_cache(
  async () => analyticsService.getCategoryPerformance(),
  ["admin-category-performance"],
  { revalidate: 300 },
);

const getCachedRevenue = unstable_cache(
  async () => analyticsService.getRevenueAnalytics("30d"),
  ["admin-revenue-30d"],
  { revalidate: 120 },
);

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [stats, categoryPerformance, revenue] = await Promise.all([
    getCachedDashboardStats(),
    getCachedCategoryPerformance(),
    getCachedRevenue(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform performance, revenue movement, and operational activity."
      />
      <StatsOverview stats={stats} />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-slate-100" />}>
            <RevenueChart data={revenue.timeline} />
          </Suspense>
        </div>
        <ActivityFeed stats={stats} />
      </div>
      <CategoryPerformance categories={categoryPerformance.slice(0, 10)} />
    </div>
  );
}
