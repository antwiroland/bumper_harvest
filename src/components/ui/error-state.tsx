import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({ title = "Something went wrong", message, action }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 text-rose-500" size={18} />
        <div>
          <h3 className="font-semibold text-rose-900">{title}</h3>
          <p className="mt-1 text-sm text-rose-700">{message}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
