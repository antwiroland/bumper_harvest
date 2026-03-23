import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Page not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The resource you requested could not be found.
        </p>
        <Link href="/">
          <Button className="mt-4">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
