import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-6 py-14 text-white md:px-10">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-lime-300/20 blur-3xl" />
      <div className="relative z-10 max-w-3xl">
        <p className="mb-3 text-sm uppercase tracking-[0.16em] text-emerald-100">Bumper Harvest</p>
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Grow package-based income with transparent tracking and protected capital.
        </h1>
        <p className="mt-4 max-w-2xl text-emerald-50">
          Subscribe by category, purchase curated product packages, and monitor progress until
          automated settlement.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button className="bg-white text-emerald-900 hover:bg-emerald-50">
              Create free account
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="bg-emerald-100 text-emerald-900 hover:bg-white">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
