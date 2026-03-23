import { PackageActions } from "@/components/admin/packages/package-actions";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

type PackageTableProps = {
  packages: Array<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    category: {
      id: string;
      name: string;
    };
  }>;
};

export function PackageTable({ packages }: PackageTableProps) {
  return (
    <DataTable
      data={packages}
      rowKey={(pkg) => pkg.id}
      columns={[
        {
          key: "name",
          header: "Package",
          render: (pkg) => (
            <div>
              <p className="font-medium text-slate-900">{pkg.name}</p>
              <p className="text-xs text-slate-500">{pkg.description ?? "No description"}</p>
            </div>
          ),
        },
        {
          key: "category",
          header: "Category",
          render: (pkg) => pkg.category.name,
        },
        {
          key: "status",
          header: "Status",
          render: (pkg) => (
            <Badge variant={pkg.isActive ? "success" : "default"}>
              {pkg.isActive ? "Active" : "Inactive"}
            </Badge>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          render: (pkg) => <PackageActions pkg={pkg} />,
        },
      ]}
    />
  );
}
