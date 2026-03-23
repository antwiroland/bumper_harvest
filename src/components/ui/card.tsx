import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: DivProps) {
  return <h3 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />;
}

export function CardDescription({ className, ...props }: DivProps) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("", className)} {...props} />;
}
