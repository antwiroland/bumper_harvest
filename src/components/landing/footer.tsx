import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bumper Harvest</p>
          <p className="text-xs text-slate-500">Package category sales platform.</p>
        </div>
        <div className="flex items-center gap-5 text-sm text-slate-600">
          <Link href="/login" className="hover:text-slate-900">
            Login
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Register
          </Link>
          <a className="hover:text-slate-900" href="#faq">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}
