import { PendingSettlements } from "@/components/admin/settlements/pending-settlements";
import { SettlementHistory } from "@/components/admin/settlements/settlement-history";
import { SettlementStats } from "@/components/admin/settlements/settlement-stats";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { salesService } from "@/lib/services/sales.service";
import { settlementService } from "@/lib/services/settlement.service";
import { analyticsService } from "@/lib/services/analytics.service";

export default async function AdminSettlementsPage() {
  await requireAdmin();
  const [pending, history, stats] = await Promise.all([
    salesService.getExpiredActivePurchases(),
    settlementService.getSettlementHistory({ page: 1, limit: 50 }),
    analyticsService.getSettlementStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlements"
        description="Process pending settlements and inspect payout history."
      />
      <SettlementStats stats={stats} />
      <PendingSettlements purchases={pending} />
      <SettlementHistory settlements={history.settlements} />
    </div>
  );
}
