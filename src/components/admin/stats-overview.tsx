import { BarChart3, Layers, Users, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

type StatsOverviewProps = {
  stats: {
    users: { totalUsers: number };
    categories: { activeCategories: number };
    packages: { totalPackages: number };
    finance: { walletBalanceTotal: number };
    activity: { pendingSettlements: number };
  };
};

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Users" value={stats.users.totalUsers} icon={<Users size={16} />} />
      <StatCard
        label="Active Categories"
        value={stats.categories.activeCategories}
        icon={<Layers size={16} />}
      />
      <StatCard
        label="Total Packages"
        value={stats.packages.totalPackages}
        icon={<BarChart3 size={16} />}
      />
      <StatCard
        label="Wallet Holdings"
        value={formatCurrency(stats.finance.walletBalanceTotal)}
        hint={`Pending settlements: ${stats.activity.pendingSettlements}`}
        icon={<Wallet size={16} />}
      />
    </div>
  );
}
