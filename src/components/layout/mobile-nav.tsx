"use client";

import type { NavItem } from "@/lib/navigation";

import { Sheet } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  title: string;
};

export function MobileNav({ open, onClose, items, title }: MobileNavProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="-mx-6 -mb-6 -mt-2 h-[calc(100vh-100px)]">
        <Sidebar items={items} title={title} onNavigate={onClose} />
      </div>
    </Sheet>
  );
}
