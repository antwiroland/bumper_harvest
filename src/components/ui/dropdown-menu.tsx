"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type DropdownItem = {
  label: string;
  onClick: () => void;
  className?: string;
};

type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownItem[];
};

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        {trigger}
        <ChevronDown size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 min-w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100",
                item.className,
              )}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
