import { NextResponse } from "next/server";

import { getCurrentUser, requireAdmin } from "@/lib/auth-utils";
import { sanitizeInput } from "@/lib/security/sanitize-input";
import { categoryService, CategoryServiceError } from "@/lib/services/category.service";
import { categoryIdSchema, updateCategorySchema } from "@/lib/validations/category";

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

    const category = await categoryService.getCategoryById(parsedId.data);
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "ADMIN";

    if (!category.isActive && !isAdmin) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof CategoryServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const parsedId = categoryIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const body = sanitizeInput(await request.json());
    const parsedBody = updateCategorySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const category = await categoryService.updateCategory(parsedId.data, parsedBody.data);
    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof CategoryServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsedId = categoryIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const category = await categoryService.deleteCategory(parsedId.data);
    return NextResponse.json({
      message: "Category deactivated successfully",
      category,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof CategoryServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
