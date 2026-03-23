"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  endDate: Date | string;
};

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = useMemo(() => new Date(endDate).getTime() - now, [endDate, now]);
  const label = remaining <= 0 ? "Ended" : formatRemaining(remaining);

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        remaining <= 0 ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {label}
    </span>
  );
}
