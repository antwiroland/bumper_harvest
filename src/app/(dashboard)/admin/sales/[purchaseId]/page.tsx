import { notFound } from "next/navigation";

import { SalesUpdateForm } from "@/components/admin/sales/sales-update-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { purchaseService, PurchaseServiceError } from "@/lib/services/purchase.service";
import { salesService, SalesServiceError } from "@/lib/services/sales.service";
import { salesIdSchema } from "@/lib/validations/sales";

type SalesDetailsPageProps = {
  params: Promise<{ purchaseId: string }>;
};

export default async function SalesDetailsPage({ params }: SalesDetailsPageProps) {
  await requireAdmin();
  const { purchaseId } = await params;
  const parsed = salesIdSchema.safeParse(purchaseId);
  if (!parsed.success) {
    notFound();
  }

  try {
    const [purchase, records, completion, isWithinWindow] = await Promise.all([
      purchaseService.getPurchaseById(parsed.data),
      salesService.getSalesRecords(parsed.data),
      salesService.calculateCompletion(parsed.data),
      salesService.isWithinSellingWindow(parsed.data),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Sales Update"
          description="Update product-level sold quantities for this purchase."
        />
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{purchase.package.name}</h2>
              <p className="text-sm text-slate-500">
                {purchase.user.name ?? purchase.user.email} ({purchase.package.category.name})
              </p>
            </div>
            <Badge variant={isWithinWindow ? "success" : "warning"}>
              {isWithinWindow ? "Window Open" : "Window Closed"}
            </Badge>
          </div>
        </Card>
        <SalesUpdateForm
          purchaseId={parsed.data}
          isWithinSellingWindow={isWithinWindow}
          completionPercent={completion.completionPercent}
          records={records}
        />
      </div>
    );
  } catch (error) {
    if (
      (error instanceof SalesServiceError && error.code === "NOT_FOUND") ||
      (error instanceof PurchaseServiceError && error.code === "NOT_FOUND")
    ) {
      notFound();
    }
    throw error;
  }
}
