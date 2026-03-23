"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json() as Promise<{ categories: unknown[] }>;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}
