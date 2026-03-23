import Link from "next/link";

import { CategoryTable } from "@/components/admin/categories/category-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { categoryService } from "@/lib/services/category.service";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await categoryService.getAllCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage category pricing, status, and subscription configuration."
        actions={
          <Link href="/admin/categories/new">
            <Button>Add category</Button>
          </Link>
        }
      />
      <CategoryTable categories={categories} />
    </div>
  );
}
