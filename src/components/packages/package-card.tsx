import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type PackageCardProps = {
  pkg: {
    id: string;
    name: string;
    description: string | null;
    category: {
      id: string;
      name: string;
      packagePrice: number;
    };
    expectedProfit: number;
    productCount: number;
  };
};

export function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Card className="h-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{pkg.name}</h3>
        <Badge>{pkg.category.name}</Badge>
      </div>
      <p className="text-sm text-slate-600">
        {pkg.description ?? "Package of products for managed sales."}
      </p>
      <div className="mt-4 space-y-1 text-sm text-slate-700">
        <p>
          Price: <CurrencyDisplay amount={pkg.category.packagePrice} />
        </p>
        <p>
          Expected profit: <CurrencyDisplay amount={pkg.expectedProfit} />
        </p>
        <p>Products: {pkg.productCount}</p>
      </div>
      <Link
        href={`/user/packages/${pkg.id}`}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        View package details
      </Link>
    </Card>
  );
}
