import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavigation, userNavigation } from "@/lib/navigation";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.role === "ADMIN" ? "ADMIN" : "USER";

  return (
    <DashboardShell
      items={role === "ADMIN" ? adminNavigation : userNavigation}
      role={role}
      userName={user.name ?? user.email ?? "User"}
    >
      {children}
    </DashboardShell>
  );
}
