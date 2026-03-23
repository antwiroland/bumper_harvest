import { PurchaseStatus } from "@prisma/client";
import { PackageCheck, Wallet } from "lucide-react";
import { Suspense } from "react";

import { ActivePackagesCard } from "@/components/dashboard/active-packages-card";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { ProgressRing } from "@/components/charts/progress-ring";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth-utils";
import { purchaseService } from "@/lib/services/purchase.service";
import { walletService } from "@/lib/services/wallet.service";
import { formatCurrency } from "@/lib/utils";

function toEarningsSeries(
  purchases: Array<{ createdAt: Date; expectedProfit: number }>,
): Array<{ date: string; earnings: number }> {
  const sorted = [...purchases].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  let runningTotal = 0;
  return sorted.map((item) => {
    runningTotal += item.expectedProfit;
    return {
      date: item.createdAt.toISOString().slice(5, 10),
      earnings: Number(runningTotal.toFixed(2)),
    };
  });
}

export default async function UserDashboardPage() {
  const user = await requireUser();

  const [wallet, purchases, recentTransactionsData] = await Promise.all([
    walletService.getWallet(user.id),
    purchaseService.getUserPurchases(user.id),
    walletService.getTransactions(user.id, { page: 1, limit: 5 }),
  ]);

  const activeCount = purchases.filter((item) => item.status === PurchaseStatus.ACTIVE).length;
  const settledCount = purchases.filter((item) => item.status === PurchaseStatus.SETTLED).length;
  const expectedProfitTotal = purchases.reduce((sum, item) => sum + item.expectedProfit, 0);
  const avgCompletion =
    purchases.length === 0
      ? 0
      : purchases.reduce((sum, item) => sum + item.completionPercent, 0) / purchases.length;
  const earningsData = toEarningsSeries(
    purchases.slice(0, 7).map((item) => ({
      createdAt: item.createdAt,
      expectedProfit: item.expectedProfit,
    })),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track wallet balance, package performance, and recent activity."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WalletCard balance={wallet.balance} />
        <ActivePackagesCard activeCount={activeCount} settledCount={settledCount} />
        <StatCard
          label="Expected Profit"
          value={formatCurrency(expectedProfitTotal)}
          hint="Projected across all purchases"
          icon={<PackageCheck size={18} />}
        />
        <StatCard
          label="Recent Transactions"
          value={recentTransactionsData.total}
          hint="Total wallet entries"
          icon={<Wallet size={18} />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-slate-100" />}>
            <EarningsChart data={earningsData} />
          </Suspense>
        </div>
        <div className="space-y-4">
          <Card className="flex flex-col items-center justify-center">
            <p className="mb-3 text-sm text-slate-600">Average completion</p>
            <ProgressRing value={avgCompletion} />
          </Card>
          <QuickActions />
        </div>
      </div>

      <RecentTransactions transactions={recentTransactionsData.transactions} />
    </div>
  );
}
