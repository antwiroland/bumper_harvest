import { PageHeader } from "@/components/ui/page-header";
import { PackageGrid } from "@/components/packages/package-grid";
import { requireUser } from "@/lib/auth-utils";
import { packageService } from "@/lib/services/package.service";
import { prisma } from "@/lib/prisma";

export default async function UserPackagesPage() {
  await requireUser();
  const packages = await packageService.getAllPackages({ includeInactive: false });

  const packageIds = packages.map((item) => item.id);
  const products = packageIds.length
    ? await prisma.product.findMany({
        where: {
          packageId: { in: packageIds },
        },
        select: {
          packageId: true,
          quantity: true,
          costPrice: true,
          sellingPrice: true,
        },
      })
    : [];

  const profitByPackageId = new Map<string, number>();
  const countByPackageId = new Map<string, number>();

  for (const product of products) {
    const currentProfit = profitByPackageId.get(product.packageId) ?? 0;
    const currentCount = countByPackageId.get(product.packageId) ?? 0;
    profitByPackageId.set(
      product.packageId,
      currentProfit + product.quantity * (product.sellingPrice - product.costPrice),
    );
    countByPackageId.set(product.packageId, currentCount + 1);
  }

  const items = packages.map((pkg) => ({
    ...pkg,
    expectedProfit: Number((profitByPackageId.get(pkg.id) ?? 0).toFixed(2)),
    productCount: countByPackageId.get(pkg.id) ?? 0,
  }));

  const categories = Array.from(
    new Map(packages.map((item) => [item.category.id, item.category])).values(),
  ).map((category) => ({ id: category.id, name: category.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description="Browse available packages, compare potential returns, and open details."
      />
      <PackageGrid packages={items} categories={categories} />
    </div>
  );
}
