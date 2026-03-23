import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6 border-t border-slate-200 pt-4">{footer}</div> : null}
    </div>
  );
}
