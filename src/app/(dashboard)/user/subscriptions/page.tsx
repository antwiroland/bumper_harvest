import { PageHeader } from "@/components/ui/page-header";
import { SubscriptionsPageContent } from "@/components/subscriptions/subscriptions-page-content";
import { requireUser } from "@/lib/auth-utils";
import { categoryService } from "@/lib/services/category.service";
import { subscriptionService } from "@/lib/services/subscription.service";
import { prisma } from "@/lib/prisma";

export default async function UserSubscriptionsPage() {
  const user = await requireUser();
  const [categories, subscriptions, packageCounts] = await Promise.all([
    categoryService.getActiveCategories(),
    subscriptionService.getUserSubscriptions(user.id),
    prisma.package.groupBy({
      by: ["categoryId"],
      _count: {
        _all: true,
      },
      where: { isActive: true },
    }),
  ]);

  const packageCountMap = new Map(packageCounts.map((item) => [item.categoryId, item._count._all]));

  const enrichedCategories = categories.map((category) => ({
    ...category,
    packageCount: packageCountMap.get(category.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories & Subscriptions"
        description="Subscribe to categories to unlock eligible package purchases."
      />
      <SubscriptionsPageContent categories={enrichedCategories} subscriptions={subscriptions} />
    </div>
  );
}
