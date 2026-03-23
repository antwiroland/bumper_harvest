import { PurchaseStatus } from "@prisma/client";

import { PurchaseCard } from "@/components/purchases/purchase-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth-utils";
import { purchaseService } from "@/lib/services/purchase.service";

export default async function UserPurchasesPage() {
  const user = await requireUser();
  const purchases = await purchaseService.getUserPurchases(user.id);

  const active = purchases.filter((item) => item.status === PurchaseStatus.ACTIVE);
  const completed = purchases.filter((item) => item.status !== PurchaseStatus.ACTIVE);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Purchases"
        description="Track active sales windows and completed settlement outcomes."
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Active purchases</h2>
        {active.length === 0 ? (
          <EmptyState
            title="No active purchases"
            description="Browse packages to start a new selling window."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Completed purchases</h2>
        {completed.length === 0 ? (
          <EmptyState
            title="No completed purchases"
            description="Settled and refunded purchases will appear here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completed.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
