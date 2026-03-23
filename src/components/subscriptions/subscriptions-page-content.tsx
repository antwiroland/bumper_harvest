"use client";

import { useMemo, useState } from "react";

import { CategoryCard } from "@/components/subscriptions/category-card";
import { MySubscriptions } from "@/components/subscriptions/my-subscriptions";
import { SubscribeModal } from "@/components/subscriptions/subscribe-modal";

type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  packagePrice: number;
  subscriptionFee: number;
  packageCount: number;
};

type SubscriptionItem = {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: Date | string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    packagePrice: number;
    subscriptionFee: number;
  };
};

type SubscriptionsPageContentProps = {
  categories: CategoryItem[];
  subscriptions: SubscriptionItem[];
};

export function SubscriptionsPageContent({
  categories,
  subscriptions,
}: SubscriptionsPageContentProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const byCategoryId = useMemo(() => {
    return new Map(subscriptions.map((item) => [item.categoryId, item]));
  }, [subscriptions]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    const found = categories.find((item) => item.id === selectedCategoryId);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      subscriptionFee: found.subscriptionFee,
    };
  }, [categories, selectedCategoryId]);

  function openModal(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            subscriptionStatus={byCategoryId.get(category.id)?.status}
            onSubscribe={openModal}
          />
        ))}
      </div>
      <MySubscriptions subscriptions={subscriptions} />
      <SubscribeModal open={open} onClose={() => setOpen(false)} category={selectedCategory} />
    </div>
  );
}
