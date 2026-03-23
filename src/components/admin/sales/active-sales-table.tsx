"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProgressIndicator } from "@/components/admin/sales/progress-indicator";
import { SearchInput } from "@/components/ui/search-input";
import { formatDate } from "@/lib/utils";

type ActiveSalesTableProps = {
  purchases: Array<{
    id: string;
    completionPercent: number;
    sellingWindowEnd: Date | string;
    user: { name: string | null; email: string };
    package: { name: string; category: { name: string } };
  }>;
};

export function ActiveSalesTable({ purchases }: ActiveSalesTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return purchases;
    const needle = search.toLowerCase();
    return purchases.filter((item) => {
      const userName = item.user.name ?? "";
      return (
        userName.toLowerCase().includes(needle) ||
        item.user.email.toLowerCase().includes(needle) ||
        item.package.name.toLowerCase().includes(needle)
      );
    });
  }, [purchases, search]);

  return (
    <div className="space-y-3">
      <SearchInput placeholder="Search by user or package" onSearch={setSearch} />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">User</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Package</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Progress</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Window End</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No matching active purchases.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">
                      {item.user.name ?? item.user.email}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.package.name}
                      <span className="ml-2 text-xs text-slate-500">
                        ({item.package.category.name})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressIndicator value={item.completionPercent} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(item.sellingWindowEnd)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/sales/${item.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Update sales
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
