"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";

import { PackageCard } from "@/components/packages/package-card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";

type PackageItem = {
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

type PackageGridProps = {
  packages: PackageItem[];
  categories: Array<{ id: string; name: string }>;
};

export function PackageGrid({ packages, categories }: PackageGridProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return packages.filter((item) => {
      if (categoryId !== "ALL" && item.category.id !== categoryId) return false;
      if (!search) return true;
      const needle = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(needle) ||
        item.category.name.toLowerCase().includes(needle) ||
        (item.description ?? "").toLowerCase().includes(needle)
      );
    });
  }, [packages, categoryId, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="w-full md:min-w-72">
            <label className="mb-1 block text-xs text-slate-500">Search</label>
            <SearchInput placeholder="Search package name/category" onSearch={setSearch} />
          </div>
          <div className="w-full md:min-w-56">
            <label className="mb-1 block text-xs text-slate-500">Category</label>
            <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="ALL">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "primary" : "secondary"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={14} className="mr-1" />
            Grid
          </Button>
          <Button
            variant={view === "list" ? "primary" : "secondary"}
            onClick={() => setView("list")}
          >
            <List size={14} className="mr-1" />
            List
          </Button>
        </div>
      </div>
      <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No packages match your filters.
          </div>
        ) : (
          filtered.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)
        )}
      </div>
    </div>
  );
}
