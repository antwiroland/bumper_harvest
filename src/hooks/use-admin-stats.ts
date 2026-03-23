"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchAdminDashboard() {
  const response = await fetch("/api/admin/analytics/dashboard");
  if (!response.ok) throw new Error("Failed to fetch admin analytics");
  return response.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });
}
