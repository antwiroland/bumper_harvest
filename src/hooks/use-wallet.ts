"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchWallet() {
  const response = await fetch("/api/wallet");
  if (!response.ok) throw new Error("Failed to fetch wallet");
  return response.json() as Promise<{ wallet: unknown }>;
}

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: fetchWallet,
  });
}
