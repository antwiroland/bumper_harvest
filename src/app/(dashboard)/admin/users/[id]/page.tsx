import { notFound } from "next/navigation";

import { UserDetails } from "@/components/admin/users/user-details";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { userService, UserServiceError } from "@/lib/services/user.service";
import { userIdSchema } from "@/lib/validations/user";

type AdminUserDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;
  const parsed = userIdSchema.safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  try {
    const [user, stats] = await Promise.all([
      userService.getUserById(parsed.data),
      userService.getUserStats(parsed.data),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="User Details"
          description="Profile, wallet, subscriptions, and purchases."
        />
        <UserDetails user={user} stats={stats} />
      </div>
    );
  } catch (error) {
    if (error instanceof UserServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
