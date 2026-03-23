"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/user/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    const formData = new FormData(event.currentTarget);
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials.");
      return;
    }

    setIsSubmitting(true);
    try {
      const callback = String(formData.get("callbackUrl") || callbackUrl);
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: callback,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        return;
      }

      router.push(result?.url ?? callback);
      router.refresh();
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      description="Access your portfolio dashboard and track package performance."
      footer={
        <p className="text-sm text-slate-600">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} method="post" className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
