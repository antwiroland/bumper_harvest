import type { HTMLAttributes } from "react";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

const variantStyles: Record<AlertVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  variant?: AlertVariant;
};

export function Alert({ title, description, variant = "info", className, ...props }: AlertProps) {
  return (
    <div className={cn("rounded-xl border p-4", variantStyles[variant], className)} {...props}>
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
