import Link from "next/link";

import { UserActions } from "@/components/admin/users/user-actions";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

type UsersTableProps = {
  users: Array<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: "USER" | "ADMIN";
    createdAt: Date | string;
    _count: {
      subscriptions: number;
      purchases: number;
    };
  }>;
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <DataTable
      data={users}
      rowKey={(user) => user.id}
      columns={[
        {
          key: "profile",
          header: "User",
          render: (user) => (
            <div>
              <p className="font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          ),
        },
        {
          key: "activity",
          header: "Activity",
          render: (user) => (
            <span className="text-xs text-slate-600">
              {user._count.subscriptions} subs / {user._count.purchases} purchases
            </span>
          ),
        },
        {
          key: "joined",
          header: "Joined",
          render: (user) => formatDate(user.createdAt),
        },
        {
          key: "actions",
          header: "Actions",
          render: (user) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/users/${user.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
              <UserActions userId={user.id} currentRole={user.role} />
            </div>
          ),
        },
      ]}
    />
  );
}
