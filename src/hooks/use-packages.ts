"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchPackages() {
  const response = await fetch("/api/packages");
  if (!response.ok) throw new Error("Failed to fetch packages");
  return response.json() as Promise<{ packages: unknown[] }>;
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackages,
  });
}
