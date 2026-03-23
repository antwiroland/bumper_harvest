"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Unexpected error</h2>
        <p className="mt-2 text-sm text-slate-600">
          Something went wrong while loading this page. Try again.
        </p>
        <Button className="mt-4" onClick={reset}>
          Retry
        </Button>
      </div>
    </div>
  );
}
