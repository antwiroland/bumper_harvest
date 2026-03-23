"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: ReactNode;
  title?: string;
};

export function Sheet({ open, onClose, side = "left", title, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <aside
        className={cn(
          "absolute top-0 h-full w-80 max-w-[90vw] border-slate-200 bg-white p-6 shadow-2xl transition",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title ?? "Menu"}</h2>
          <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
