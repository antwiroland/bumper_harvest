"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchSubscriptions() {
  const response = await fetch("/api/subscriptions");
  if (!response.ok) throw new Error("Failed to fetch subscriptions");
  return response.json() as Promise<{ subscriptions: unknown[] }>;
}

export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
  });
}
