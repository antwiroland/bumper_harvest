import { NextResponse } from "next/server";

import { getCurrentUser, requireAdmin } from "@/lib/auth-utils";
import { sanitizeInput } from "@/lib/security/sanitize-input";
import { packageService, PackageServiceError } from "@/lib/services/package.service";
import { createPackageSchema, packageQuerySchema } from "@/lib/validations/package";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = packageQuerySchema.safeParse({
      categoryId: url.searchParams.get("categoryId") ?? undefined,
      includeInactive: url.searchParams.get("includeInactive") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const currentUser = await getCurrentUser();
    const includeInactive = currentUser?.role === "ADMIN" && parsed.data.includeInactive;
    const packages = await packageService.getAllPackages({
      ...parsed.data,
      includeInactive,
    });

    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = sanitizeInput(await request.json());
    const parsed = createPackageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const item = await packageService.createPackage(parsed.data);
    return NextResponse.json({ package: item }, { status: 201 });
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
