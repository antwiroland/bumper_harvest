import { AccountActions } from "@/components/settings/account-actions";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export default async function UserSettingsPage() {
  const authUser = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage profile details, update security settings, and configure preferences."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <ProfileForm initial={user} />
        <PasswordForm />
        <NotificationSettings />
        <AccountActions />
      </div>
    </div>
  );
}
