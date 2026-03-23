import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
      <h2 className="text-2xl font-semibold text-slate-900">
        Start tracking package performance today
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
        Build from subscription to purchase to settlement with a dashboard that keeps every
        transaction visible.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/register">
          <Button>Create account</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </section>
  );
}
