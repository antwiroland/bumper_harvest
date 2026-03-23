"use client";

import { useState, type ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import type { NavItem } from "@/lib/navigation";

type DashboardShellProps = {
  items: NavItem[];
  userName: string;
  role: "USER" | "ADMIN";
  children: ReactNode;
};

export function DashboardShell({ items, userName, role, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar
          items={items}
          title={role === "ADMIN" ? "Admin Panel" : "My Dashboard"}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </div>
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={items}
        title={role === "ADMIN" ? "Admin Panel" : "My Dashboard"}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header userName={userName} role={role} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
