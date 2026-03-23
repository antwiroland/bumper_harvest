"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type ProfileFormProps = {
  initial: {
    name: string;
    email: string;
    phone: string | null;
  };
};

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to update profile.");
      return;
    }

    notify("Profile updated");
    router.refresh();
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Profile information</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Full name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Email</label>
          <Input value={initial.email} disabled />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Phone</label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
