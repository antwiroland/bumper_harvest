import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  const bounded = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-200", className)}>
      <div
        className="h-2 rounded-full bg-primary transition-all"
        style={{ width: `${bounded}%` }}
      />
    </div>
  );
}
