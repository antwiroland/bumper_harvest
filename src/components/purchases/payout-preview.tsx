import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type PayoutPreviewProps = {
  packagePrice: number;
  expectedProfit: number;
  completionPercent: number;
};

export function PayoutPreview({
  packagePrice,
  expectedProfit,
  completionPercent,
}: PayoutPreviewProps) {
  const isSuccessful = completionPercent >= 70;
  const estimatedPayout = isSuccessful ? packagePrice + expectedProfit * 0.9 : packagePrice;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Payout preview</h3>
      <p className="mt-1 text-sm text-slate-600">
        {isSuccessful
          ? "Current progress is above success threshold."
          : "Current progress is below success threshold."}
      </p>
      <div className="mt-4 space-y-1 text-sm text-slate-700">
        <p>
          Completion: <span className="font-medium">{completionPercent.toFixed(2)}%</span>
        </p>
        <p>
          Estimated payout: <CurrencyDisplay amount={estimatedPayout} />
        </p>
      </div>
    </Card>
  );
}
