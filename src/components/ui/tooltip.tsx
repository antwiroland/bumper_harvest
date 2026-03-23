"use client";

import { useState, type ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
};

export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span className="absolute -top-10 left-1/2 z-30 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white">
          {label}
        </span>
      ) : null}
    </span>
  );
}
