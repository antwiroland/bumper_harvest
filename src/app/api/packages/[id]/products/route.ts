import { NextResponse } from "next/server";

import { getCurrentUser, requireAdmin } from "@/lib/auth-utils";
import { sanitizeInput } from "@/lib/security/sanitize-input";
import { packageService, PackageServiceError } from "@/lib/services/package.service";
import { createProductInPackageSchema, packageIdSchema } from "@/lib/validations/package";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsedId = packageIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid package id" }, { status: 400 });
    }

    const item = await packageService.getPackageWithProducts(parsedId.data);
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "ADMIN";
    if (!item.isActive && !isAdmin) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({
      package: {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        isActive: item.isActive,
      },
      products: item.products,
    });
  } catch (error) {
    if (error instanceof PackageServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsedId = packageIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid package id" }, { status: 400 });
    }

    const body = sanitizeInput(await request.json());
    const parsedBody = createProductInPackageSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const product = await packageService.addProductToPackage(parsedId.data, parsedBody.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof PackageServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
