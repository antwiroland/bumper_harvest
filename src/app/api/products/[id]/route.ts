import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { productService, ProductServiceError } from "@/lib/services/product.service";
import { productIdSchema, updateProductSchema } from "@/lib/validations/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsedId = productIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await productService.getProductById(parsedId.data);
    const metrics = productService.calculateProductProfit(product);
    return NextResponse.json({ product, metrics });
  } catch (error) {
    if (error instanceof ProductServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsedId = productIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateProductSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const product = await productService.updateProduct(parsedId.data, parsedBody.data);
    const metrics = productService.calculateProductProfit(product);
    return NextResponse.json({ product, metrics });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof ProductServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsedId = productIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await productService.deleteProduct(parsedId.data);
    return NextResponse.json({ message: "Product deleted successfully", product });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof ProductServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
