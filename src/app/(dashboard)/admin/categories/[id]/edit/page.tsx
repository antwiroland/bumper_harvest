import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/category-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { categoryService, CategoryServiceError } from "@/lib/services/category.service";
import { categoryIdSchema } from "@/lib/validations/category";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await requireAdmin();
  const { id } = await params;
  const parsed = categoryIdSchema.safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  try {
    const category = await categoryService.getCategoryById(parsed.data);
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Category" description="Update category details and pricing." />
        <CategoryForm mode="edit" initial={category} />
      </div>
    );
  } catch (error) {
    if (error instanceof CategoryServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
