"use client";

import { useState } from "react";

import { PurchaseModal } from "@/components/packages/purchase-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type PackageDetailsProps = {
  pkg: {
    id: string;
    name: string;
    description: string | null;
    category: {
      id: string;
      name: string;
      packagePrice: number;
      subscriptionFee: number;
    };
  };
  metrics: {
    expectedProfit: number;
    totalCost: number;
    totalRevenue: number;
    productCount: number;
  };
  hasActiveSubscription: boolean;
};

export function PackageDetails({ pkg, metrics, hasActiveSubscription }: PackageDetailsProps) {
  const [openPurchase, setOpenPurchase] = useState(false);

  return (
    <>
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">{pkg.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {pkg.description ??
            "Review package products and purchase to begin the 7-day sales window."}
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p>
            Category: <span className="font-medium text-slate-900">{pkg.category.name}</span>
          </p>
          <p>
            Package price: <CurrencyDisplay amount={pkg.category.packagePrice} />
          </p>
          <p>
            Expected profit: <CurrencyDisplay amount={metrics.expectedProfit} />
          </p>
          <p>Products: {metrics.productCount}</p>
        </div>
        <div className="mt-5">
          {!hasActiveSubscription ? (
            <p className="mb-2 text-sm text-amber-700">
              Active subscription required before purchase for this category.
            </p>
          ) : null}
          <Button onClick={() => setOpenPurchase(true)} disabled={!hasActiveSubscription}>
            Purchase package
          </Button>
        </div>
      </Card>
      <PurchaseModal
        open={openPurchase}
        onClose={() => setOpenPurchase(false)}
        pkg={{
          id: pkg.id,
          name: pkg.name,
          categoryName: pkg.category.name,
          price: pkg.category.packagePrice,
          expectedProfit: metrics.expectedProfit,
        }}
      />
    </>
  );
}
