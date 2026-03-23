"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function NotificationSettings() {
  const { notify } = useToast();
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [settlementAlerts, setSettlementAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);

  function savePreferences() {
    notify("Notification preferences saved");
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Notification preferences</h3>
      <div className="mt-4 space-y-3">
        <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
          Email updates for wallet activity
          <input
            type="checkbox"
            checked={emailUpdates}
            onChange={(event) => setEmailUpdates(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
          Settlement result alerts
          <input
            type="checkbox"
            checked={settlementAlerts}
            onChange={(event) => setSettlementAlerts(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
          Product announcements
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </label>
      </div>
      <Button className="mt-4" onClick={savePreferences}>
        Save preferences
      </Button>
    </Card>
  );
}
