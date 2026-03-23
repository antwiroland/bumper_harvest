import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

type SettlementStatsProps = {
  stats: {
    totalSettlements: number;
    settledPurchases: number;
    refundedPurchases: number;
    totalPayout: number;
    totalCommission: number;
  };
};

export function SettlementStats({ stats }: SettlementStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Total Settlements" value={stats.totalSettlements} />
      <StatCard label="Settled" value={stats.settledPurchases} />
      <StatCard label="Refunded" value={stats.refundedPurchases} />
      <StatCard label="Total Payout" value={formatCurrency(stats.totalPayout)} />
      <StatCard label="Commission" value={formatCurrency(stats.totalCommission)} />
    </div>
  );
}
