"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
};

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  if (!current) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition",
              tab.id === current.id
                ? "bg-white font-medium text-slate-900 shadow-sm"
                : "text-slate-600",
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current.content}</div>
    </div>
  );
}
