import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { productService, ProductServiceError } from "@/lib/services/product.service";
import { createProductSchema, productQuerySchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsedQuery = productQuerySchema.safeParse({
      packageId: url.searchParams.get("packageId") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.flatten() },
        { status: 400 },
      );
    }

    const products = await productService.getProducts(parsedQuery.data);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const product = await productService.createProduct(parsed.data);
    const metrics = productService.calculateProductProfit(product);
    return NextResponse.json({ product, metrics }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof ProductServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
