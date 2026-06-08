"use client";

import type { Crop } from "@/lib/garden/schema";
import { fmtDate } from "@/lib/garden/schedule";

const DAY = 86400000;

interface DateScrubberProps {
  start: Date;
  end: Date;
  value: Date;
  onChange: (d: Date) => void;
  crops: Crop[];
  cropColors: Map<string, string>;
}

export function DateScrubber({
  start,
  end,
  value,
  onChange,
  crops,
  cropColors,
}: DateScrubberProps) {
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY));
  const offset = Math.round((value.getTime() - start.getTime()) / DAY);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-ink-3">
          As of
        </span>
        <input
          type="range"
          min={0}
          max={totalDays}
          value={Math.min(Math.max(offset, 0), totalDays)}
          onChange={(e) => onChange(new Date(start.getTime() + Number(e.target.value) * DAY))}
          className="h-1 flex-1 accent-rust"
        />
        <span className="w-28 shrink-0 text-right font-mono text-sm tabular-nums text-ink">
          {`${fmtDate(value)} '${String(value.getFullYear()).slice(2)}`}
        </span>
      </div>
      {crops.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {crops.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: cropColors.get(c.id) }}
              />
              <span className="text-xs text-ink-3">{c.name}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
