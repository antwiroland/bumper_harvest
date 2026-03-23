import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type ProfitCalculatorProps = {
  packagePrice: number;
  expectedProfit: number;
};

export function ProfitCalculator({ packagePrice, expectedProfit }: ProfitCalculatorProps) {
  const estimatedPayout = packagePrice + expectedProfit * 0.9;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Profit calculator</h3>
      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p>
          Capital: <CurrencyDisplay amount={packagePrice} />
        </p>
        <p>
          Estimated profit: <CurrencyDisplay amount={expectedProfit} />
        </p>
        <p className="text-xs text-slate-500">
          Commission applies only to successful sales outcomes.
        </p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">
        Estimated payout: <CurrencyDisplay amount={estimatedPayout} />
      </p>
    </Card>
  );
}
