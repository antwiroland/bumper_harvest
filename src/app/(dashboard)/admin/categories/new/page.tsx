import { CategoryForm } from "@/components/admin/categories/category-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="New Category" description="Create a category for package subscriptions." />
      <CategoryForm mode="create" />
    </div>
  );
}
