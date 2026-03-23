import { notFound } from "next/navigation";

import { PackageForm } from "@/components/admin/packages/package-form";
import { ProductManager } from "@/components/admin/packages/product-manager";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { categoryService } from "@/lib/services/category.service";
import { packageService, PackageServiceError } from "@/lib/services/package.service";
import { packageIdSchema } from "@/lib/validations/package";

type EditPackagePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  await requireAdmin();
  const { id } = await params;
  const parsed = packageIdSchema.safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  try {
    const [pkg, categories] = await Promise.all([
      packageService.getPackageWithProducts(parsed.data),
      categoryService.getAllCategories(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Package"
          description="Update package details and manage products."
        />
        <PackageForm
          mode="edit"
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          initial={{
            id: pkg.id,
            categoryId: pkg.categoryId,
            name: pkg.name,
            description: pkg.description,
            imageUrl: pkg.imageUrl,
            isActive: pkg.isActive,
          }}
        />
        <ProductManager packageId={pkg.id} products={pkg.products} />
      </div>
    );
  } catch (error) {
    if (error instanceof PackageServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
