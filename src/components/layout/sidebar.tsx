"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesColumn,
  CreditCard,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: NavItem[];
  title: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const navIconMap: Record<NavItem["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  wallet: CreditCard,
  subscriptions: ShieldCheck,
  packages: Package,
  purchases: ShoppingBag,
  settings: Settings,
  categories: ChartNoAxesColumn,
  sales: ShoppingCart,
  users: Users,
  settlements: Receipt,
};

export function Sidebar({
  items,
  title,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="border-b border-slate-200 px-4 py-5">
        {collapsed ? (
          <p className="text-center text-[10px] uppercase tracking-widest text-primary">BH</p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-primary">Bumper Harvest</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
          </>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = navIconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-primary text-primary-foreground" : "text-slate-700 hover:bg-slate-100",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} />
              {!collapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>
      {onToggleCollapse ? (
        <button
          className="m-3 rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-600 hover:bg-slate-100"
          onClick={onToggleCollapse}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      ) : null}
    </aside>
  );
}
