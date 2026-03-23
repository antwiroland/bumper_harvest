import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FormField({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

type FormLabelProps = HTMLAttributes<HTMLLabelElement>;

export function FormLabel({ className, ...props }: FormLabelProps) {
  return <label className={cn("block text-sm text-slate-700", className)} {...props} />;
}

type FormInputProps = InputHTMLAttributes<HTMLInputElement>;

export function FormInput({ className, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}

type FormMessageProps = {
  children: ReactNode;
  error?: boolean;
  className?: string;
};

export function FormMessage({ children, error = false, className }: FormMessageProps) {
  return (
    <p className={cn("text-xs", error ? "text-rose-600" : "text-slate-500", className)}>
      {children}
    </p>
  );
}
