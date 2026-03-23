"use client";

import { useMemo } from "react";

import { Input } from "@/components/ui/input";

type CalendarProps = {
  value?: Date;
  onChange?: (value: Date) => void;
  min?: Date;
  max?: Date;
};

function toInputDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function Calendar({ value, onChange, min, max }: CalendarProps) {
  const inputValue = useMemo(() => (value ? toInputDate(value) : ""), [value]);

  return (
    <Input
      type="date"
      value={inputValue}
      min={min ? toInputDate(min) : undefined}
      max={max ? toInputDate(max) : undefined}
      onChange={(event) => {
        if (!onChange) return;
        onChange(new Date(`${event.target.value}T00:00:00`));
      }}
    />
  );
}
