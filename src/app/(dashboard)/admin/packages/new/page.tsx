import { PackageForm } from "@/components/admin/packages/package-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { categoryService } from "@/lib/services/category.service";

export default async function NewPackagePage() {
  await requireAdmin();
  const categories = await categoryService.getAllCategories();

  return (
    <div className="space-y-6">
      <PageHeader title="New Package" description="Create a package and assign it to a category." />
      <PackageForm
        mode="create"
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
