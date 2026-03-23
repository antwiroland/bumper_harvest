"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <button
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="font-medium text-slate-900">{item.title}</span>
              <ChevronDown
                size={18}
                className={cn("text-slate-500 transition", isOpen ? "rotate-180" : "rotate-0")}
              />
            </button>
            {isOpen ? <div className="mt-3 text-sm text-slate-600">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
