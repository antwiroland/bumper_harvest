import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
      <main className="relative z-10 grid min-h-screen place-items-center px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur md:p-8">
          <Link href="/" className="mb-6 inline-flex flex-col">
            <span className="text-xs uppercase tracking-[0.18em] text-primary">Bumper Harvest</span>
            <span className="text-sm text-slate-600">Package Category Sales Platform</span>
          </Link>
          {children}
        </section>
      </main>
    </div>
  );
}
