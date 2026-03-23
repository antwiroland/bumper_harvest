import { ProgressBar } from "@/components/purchases/progress-bar";

type ProgressIndicatorProps = {
  value: number;
};

export function ProgressIndicator({ value }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <ProgressBar value={value} className="w-40" />
      <span className="text-xs text-slate-600">{value.toFixed(2)}%</span>
    </div>
  );
}
