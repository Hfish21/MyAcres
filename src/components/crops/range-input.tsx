"use client";

import { Input } from "@/components/ui/input";

// A min–max paired numeric input. Values are strings (form-friendly); the
// dialog parses them on submit.

export interface RangeValue {
  min: string;
  max: string;
}

interface RangeInputProps {
  value: RangeValue;
  onChange: (next: RangeValue) => void;
  unit?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export function RangeInput({
  value,
  onChange,
  unit,
  minPlaceholder = "min",
  maxPlaceholder = "max",
}: RangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="numeric"
        className="font-mono"
        placeholder={minPlaceholder}
        value={value.min}
        onChange={(e) => onChange({ ...value, min: e.target.value })}
      />
      <span className="shrink-0 text-ink-3">–</span>
      <Input
        type="number"
        inputMode="numeric"
        className="font-mono"
        placeholder={maxPlaceholder}
        value={value.max}
        onChange={(e) => onChange({ ...value, max: e.target.value })}
      />
      {unit ? <span className="shrink-0 text-sm text-ink-3">{unit}</span> : null}
    </div>
  );
}
