"use client";

import { Bell, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

import { DropdownMenu } from "@/components/ui/dropdown-menu";

type HeaderProps = {
  userName: string;
  role: "USER" | "ADMIN";
  onMenuClick: () => void;
};

export function Header({ userName, role, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {role === "ADMIN" ? "Admin Workspace" : "User Workspace"}
          </p>
          <p className="text-xs text-slate-500">Track sales, subscriptions, and payouts.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500" />
        </button>
        <DropdownMenu
          trigger={<span className="truncate max-w-28">{userName}</span>}
          items={[
            {
              label: "Sign out",
              onClick: () => {
                void signOut({ callbackUrl: "/login" });
              },
            },
          ]}
        />
      </div>
    </header>
  );
}
