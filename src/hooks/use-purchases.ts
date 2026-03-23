"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchPurchases() {
  const response = await fetch("/api/purchases");
  if (!response.ok) throw new Error("Failed to fetch purchases");
  return response.json();
}

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: fetchPurchases,
  });
}
