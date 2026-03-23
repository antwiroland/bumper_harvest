import { CategoryActions } from "@/components/admin/categories/category-actions";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { CurrencyDisplay } from "@/components/ui/currency-display";

type CategoryTableProps = {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    packagePrice: number;
    subscriptionFee: number;
    isActive: boolean;
  }>;
};

export function CategoryTable({ categories }: CategoryTableProps) {
  return (
    <DataTable
      data={categories}
      rowKey={(category) => category.id}
      columns={[
        {
          key: "name",
          header: "Category",
          render: (category) => (
            <div>
              <p className="font-medium text-slate-900">{category.name}</p>
              <p className="text-xs text-slate-500">{category.description ?? "No description"}</p>
            </div>
          ),
        },
        {
          key: "packagePrice",
          header: "Package Price",
          render: (category) => <CurrencyDisplay amount={category.packagePrice} />,
        },
        {
          key: "subscriptionFee",
          header: "Subscription Fee",
          render: (category) => <CurrencyDisplay amount={category.subscriptionFee} />,
        },
        {
          key: "status",
          header: "Status",
          render: (category) => (
            <Badge variant={category.isActive ? "success" : "default"}>
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          render: (category) => <CategoryActions category={category} />,
        },
      ]}
    />
  );
}
