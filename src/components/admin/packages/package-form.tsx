"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

type PackageFormProps = {
  mode: "create" | "edit";
  categories: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
  };
};

export function PackageForm({ mode, categories, initial }: PackageFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload =
      mode === "create"
        ? {
            categoryId,
            name: name.trim(),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            isActive,
          }
        : {
            name: name.trim(),
            description: description.trim(),
            imageUrl: imageUrl.trim() || undefined,
            isActive,
          };

    const endpoint = mode === "create" ? "/api/packages" : `/api/packages/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to save package.");
      return;
    }

    notify(`Package ${mode === "create" ? "created" : "updated"} successfully`);
    router.push("/admin/packages");
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Category</label>
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={mode === "edit"}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Package name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Description</label>
          <Input value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Image URL (optional)</label>
          <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
        </div>
        <label className="flex items-center justify-between text-sm text-slate-700">
          Active
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create package" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
