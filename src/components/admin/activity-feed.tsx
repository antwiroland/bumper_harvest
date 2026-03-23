import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type ActivityFeedProps = {
  stats: {
    activity: {
      activePurchases: number;
      activeSubscriptions: number;
      pendingSettlements: number;
    };
    finance: {
      totalCommission: number;
      totalPayout: number;
    };
  };
};

export function ActivityFeed({ stats }: ActivityFeedProps) {
  const items = [
    `${stats.activity.activePurchases} purchases currently active`,
    `${stats.activity.activeSubscriptions} active subscriptions across categories`,
    `${stats.activity.pendingSettlements} purchases waiting settlement`,
    `Total commissions collected: ${formatCurrency(stats.finance.totalCommission)}`,
    `Total payouts processed: ${formatCurrency(stats.finance.totalPayout)}`,
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
