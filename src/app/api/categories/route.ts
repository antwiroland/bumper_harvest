import { NextResponse } from "next/server";

import { getCurrentUser, requireAdmin } from "@/lib/auth-utils";
import { sanitizeInput } from "@/lib/security/sanitize-input";
import { categoryService, CategoryServiceError } from "@/lib/services/category.service";
import { categoryQuerySchema, createCategorySchema } from "@/lib/validations/category";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsedQuery = categoryQuerySchema.safeParse({
      includeInactive: url.searchParams.get("includeInactive") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.flatten() },
        { status: 400 },
      );
    }

    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "ADMIN";
    const shouldIncludeInactive = isAdmin && parsedQuery.data.includeInactive;
    const categories = shouldIncludeInactive
      ? await categoryService.getAllCategories()
      : await categoryService.getActiveCategories();

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = sanitizeInput(await request.json());
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const category = await categoryService.createCategory(parsed.data);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof CategoryServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
