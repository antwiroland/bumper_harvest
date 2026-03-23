"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  debounceMs?: number;
  onSearch: (value: string) => void;
};

export function SearchInput({
  placeholder = "Search...",
  value = "",
  debounceMs = 300,
  onSearch,
}: SearchInputProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(internal.trim()), debounceMs);
    return () => window.clearTimeout(timer);
  }, [internal, debounceMs, onSearch]);

  return (
    <label className="relative block">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        value={internal}
        onChange={(event) => setInternal(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary"
      />
    </label>
  );
}
