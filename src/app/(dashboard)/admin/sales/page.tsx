import { ActiveSalesTable } from "@/components/admin/sales/active-sales-table";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { purchaseService } from "@/lib/services/purchase.service";

export default async function AdminSalesPage() {
  await requireAdmin();

  const result = await purchaseService.getAllPurchases({
    page: 1,
    limit: 100,
    activeOnly: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Tracking"
        description="Monitor active purchases and update per-product sold quantities."
      />
      <ActiveSalesTable purchases={result.purchases} />
    </div>
  );
}
