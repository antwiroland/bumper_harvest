import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-utils";
import { categoryService, CategoryServiceError } from "@/lib/services/category.service";
import { categoryIdSchema } from "@/lib/validations/category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsedId = categoryIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const category = await categoryService.getCategoryWithPackages(parsedId.data);
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "ADMIN";
    if (!category.isActive && !isAdmin) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const packages = isAdmin
      ? category.packages
      : category.packages.filter((item) => item.isActive);

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        packagePrice: category.packagePrice,
        subscriptionFee: category.subscriptionFee,
        isActive: category.isActive,
      },
      packages,
    });
  } catch (error) {
    if (error instanceof CategoryServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
