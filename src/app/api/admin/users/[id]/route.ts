import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-utils";
import { auditLog } from "@/lib/security/audit-log";
import { UserServiceError, userService } from "@/lib/services/user.service";
import { updateUserRoleSchema, userIdSchema } from "@/lib/validations/user";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsedId = userIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: "Invalid user id", details: parsedId.error.flatten() },
        { status: 400 },
      );
    }

    const [user, stats] = await Promise.all([
      userService.getUserById(parsedId.data),
      userService.getUserStats(parsedId.data),
    ]);

    return NextResponse.json({ user, stats });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof UserServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const parsedId = userIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: "Invalid user id", details: parsedId.error.flatten() },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsedBody = updateUserRoleSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await userService.updateUserRole(parsedId.data, parsedBody.data.role);
    auditLog("admin.user.role_updated", {
      adminId: admin.id,
      targetUserId: parsedId.data,
      role: parsedBody.data.role,
    });
    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof UserServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const parsedId = userIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "Invalid user id", details: parsedId.error.flatten() },
        { status: 400 },
      );
    }

    const user = await userService.suspendUser(parsedId.data);
    auditLog("admin.user.suspended", {
      adminId: admin.id,
      targetUserId: parsedId.data,
    });
    return NextResponse.json({
      message: "User account suspended successfully",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof UserServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
