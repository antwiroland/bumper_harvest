import { notFound } from "next/navigation";

import { CountdownTimer } from "@/components/purchases/countdown-timer";
import { PayoutPreview } from "@/components/purchases/payout-preview";
import { ProductProgressTable } from "@/components/purchases/product-progress-table";
import { ProgressBar } from "@/components/purchases/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth-utils";
import { purchaseService, PurchaseServiceError } from "@/lib/services/purchase.service";
import { purchaseIdSchema } from "@/lib/validations/purchase";

type PurchaseDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PurchaseDetailsPage({ params }: PurchaseDetailsPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const parsedId = purchaseIdSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  try {
    const purchase = await purchaseService.getPurchaseById(parsedId.data);
    if (purchase.userId !== user.id) {
      notFound();
    }
    const progress = await purchaseService.getPurchaseProgress(parsedId.data);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Purchase Details"
          description="Monitor completion, product-level sales, and payout outlook."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{purchase.package.name}</h2>
                <p className="text-sm text-slate-500">{purchase.package.category.name}</p>
              </div>
              <Badge
                variant={
                  purchase.status === "SETTLED"
                    ? "success"
                    : purchase.status === "ACTIVE"
                      ? "warning"
                      : "default"
                }
              >
                {purchase.status}
              </Badge>
            </div>
            <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <p>
                Purchase price: <CurrencyDisplay amount={purchase.purchasePrice} />
              </p>
              <p>
                Expected profit: <CurrencyDisplay amount={purchase.expectedProfit} />
              </p>
            </div>
            <div className="mt-4">
              <p className="mb-1 text-xs text-slate-500">Overall completion</p>
              <div className="flex items-center gap-3">
                <ProgressBar value={progress.completionPercent} className="max-w-md" />
                <span className="text-sm font-medium text-slate-700">
                  {progress.completionPercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <CountdownTimer endDate={progress.sellingWindowEnd} />
            </div>
          </Card>
          <PayoutPreview
            packagePrice={purchase.purchasePrice}
            expectedProfit={purchase.expectedProfit}
            completionPercent={progress.completionPercent}
          />
        </div>
        <ProductProgressTable products={progress.products} />
      </div>
    );
  } catch (error) {
    if (error instanceof PurchaseServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
