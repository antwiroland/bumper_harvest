import { notFound } from "next/navigation";

import { PackageDetails } from "@/components/packages/package-details";
import { ProductList } from "@/components/packages/product-list";
import { ProfitCalculator } from "@/components/packages/profit-calculator";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth-utils";
import { packageService, PackageServiceError } from "@/lib/services/package.service";
import { subscriptionService } from "@/lib/services/subscription.service";
import { packageIdSchema } from "@/lib/validations/package";

type PackageDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PackageDetailsPage({ params }: PackageDetailsPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const parsedId = packageIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  try {
    const [pkg, metrics] = await Promise.all([
      packageService.getPackageWithProducts(parsedId.data),
      packageService.calculatePackageMetrics(parsedId.data),
    ]);

    const hasActiveSubscription = await subscriptionService.hasActiveSubscription(
      user.id,
      pkg.categoryId,
    );

    return (
      <div className="space-y-6">
        <PageHeader
          title="Package details"
          description="Review package products, pricing, and purchase eligibility."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PackageDetails
              pkg={pkg}
              metrics={metrics}
              hasActiveSubscription={hasActiveSubscription}
            />
          </div>
          <ProfitCalculator
            packagePrice={pkg.category.packagePrice}
            expectedProfit={metrics.expectedProfit}
          />
        </div>
        <ProductList products={pkg.products} />
      </div>
    );
  } catch (error) {
    if (error instanceof PackageServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
