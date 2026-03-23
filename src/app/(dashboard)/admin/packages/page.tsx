import Link from "next/link";

import { PackageTable } from "@/components/admin/packages/package-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth-utils";
import { packageService } from "@/lib/services/package.service";

export default async function AdminPackagesPage() {
  await requireAdmin();
  const packages = await packageService.getAllPackages({ includeInactive: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description="Create and manage package catalog under each category."
        actions={
          <Link href="/admin/packages/new">
            <Button>Add package</Button>
          </Link>
        }
      />
      <PackageTable packages={packages} />
    </div>
  );
}
