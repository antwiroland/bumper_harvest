"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone should be at least 7 digits.")
    .max(20, "Phone should not exceed 20 characters.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters."),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms." }),
  }),
});

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: "Weak", color: "bg-rose-500", width: "w-1/4" };
  if (score <= 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
  if (score <= 3) return { label: "Good", color: "bg-lime-500", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-600", width: "w-full" };
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
      acceptTerms: formData.get("acceptTerms") === "on",
    };

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || undefined,
          password: parsed.data.password,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Registration failed. Please try again.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: "/user/dashboard",
      });

      if (signInResult?.error) {
        router.push("/login?registered=1");
        router.refresh();
        return;
      }

      router.push(signInResult?.url ?? "/user/dashboard");
      router.refresh();
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      description="Start subscribing to package categories and build earnings."
      footer={
        <p className="text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} method="post" className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="name">
            Full name
          </label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="phone">
            Phone (optional)
          </label>
          <Input id="phone" name="phone" autoComplete="tel" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onInput={(event) => setPassword((event.target as HTMLInputElement).value)}
          />
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-slate-200">
              <div className={`h-1.5 rounded-full ${strength.color} ${strength.width}`} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Strength: {strength.label}</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="acceptTerms" className="h-4 w-4 rounded border-slate-300" />I
          accept the terms and conditions.
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
