"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AccountActions() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Account actions</h3>
      <p className="mt-2 text-sm text-slate-600">Sign out from your current session.</p>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={() => void signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </Button>
    </Card>
  );
}
