import { Role } from "@prisma/client";

import { UsersTable } from "@/components/admin/users/users-table";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { requireAdmin } from "@/lib/auth-utils";
import { userService } from "@/lib/services/user.service";

type AdminUsersPageProps = {
  searchParams?: Promise<{ role?: string; search?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const role =
    params?.role === "ADMIN" || params?.role === "USER" ? (params.role as Role) : undefined;
  const search = params?.search?.trim() ? params.search.trim() : undefined;

  const result = await userService.getAllUsers({
    page: 1,
    limit: 100,
    role,
    search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search users, filter by role, inspect details, and manage account access."
      />

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search by name or email"
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-primary"
        />
        <Select name="role" defaultValue={role ?? ""}>
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </Select>
        <button className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Apply
        </button>
      </form>

      <UsersTable users={result.users} />
    </div>
  );
}
