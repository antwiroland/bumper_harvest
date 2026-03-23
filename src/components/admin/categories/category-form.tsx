"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type CategoryFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    description: string | null;
    packagePrice: number;
    subscriptionFee: number;
    isActive: boolean;
  };
};

export function CategoryForm({ mode, initial }: CategoryFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [packagePrice, setPackagePrice] = useState(String(initial?.packagePrice ?? ""));
  const [subscriptionFee, setSubscriptionFee] = useState(String(initial?.subscriptionFee ?? ""));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      packagePrice: Number(packagePrice),
      subscriptionFee: Number(subscriptionFee),
      isActive,
    };

    const endpoint = mode === "create" ? "/api/categories" : `/api/categories/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Request failed.");
      return;
    }

    notify(`Category ${mode === "create" ? "created" : "updated"} successfully`);
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={submitForm} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Description</label>
          <Input value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Package price</label>
            <Input
              type="number"
              min={1}
              step="0.01"
              value={packagePrice}
              onChange={(event) => setPackagePrice(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Subscription fee</label>
            <Input
              type="number"
              min={1}
              step="0.01"
              value={subscriptionFee}
              onChange={(event) => setSubscriptionFee(event.target.value)}
              required
            />
          </div>
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
          {isSubmitting ? "Saving..." : mode === "create" ? "Create category" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
