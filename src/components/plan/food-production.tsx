"use client";

import * as React from "react";

import type { Crop, Planting } from "@/lib/garden/schema";
import { monthLabel, timelineWindow, yieldByMonth } from "@/lib/garden/insights";

// Distinct-ish washes for the different yield units, drawn from the earth palette.
const UNIT_COLORS = [
  "var(--olive)",
  "var(--amber)",
  "var(--rust)",
  "var(--inkblue)",
  "var(--ochre)",
];

interface FoodProductionProps {
  plantings: Planting[];
  crops: Crop[];
}

function fmt(n: number): string {
  return n >= 100 ? Math.round(n).toString() : n.toFixed(n >= 10 ? 0 : 1);
}

export function FoodProduction({ plantings, crops }: FoodProductionProps) {
  const { months } = timelineWindow(plantings, crops);
  const byMonth = React.useMemo(
    () => yieldByMonth(plantings, crops, months),
    [plantings, crops, months],
  );

  const units = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of byMonth) for (const u of m.keys()) set.add(u);
    return [...set].sort();
  }, [byMonth]);

  const cropsWithYield = crops.filter((c) => c.yieldPerPlant).length;

  if (units.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line py-8 text-center text-sm text-ink-3">
        No yield data yet. Add <span className="text-ink-2">yield per plant</span> to your
        crops to project food production over the year.
      </div>
    );
  }

  const unitColor = new Map(units.map((u, i) => [u, UNIT_COLORS[i % UNIT_COLORS.length]]));
  const monthTotals = byMonth.map((m) => [...m.values()].reduce((a, b) => a + b, 0));
  const max = Math.max(1, ...monthTotals);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1 overflow-x-auto">
        {months.map((m, i) => {
          const map = byMonth[i];
          const total = monthTotals[i];
          const title = [...map.entries()]
            .map(([u, v]) => `${fmt(v)} ${u}`)
            .join(", ");
          return (
            <div key={i} className="flex min-w-9 flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end">
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-t-[3px]"
                  style={{ height: `${(total / max) * 100}%` }}
                  title={`${monthLabel(m)}: ${title || "—"}`}
                >
                  {units.map((u) => {
                    const v = map.get(u) ?? 0;
                    if (v <= 0) return null;
                    return (
                      <div
                        key={u}
                        style={{
                          height: `${(v / total) * 100}%`,
                          backgroundColor: unitColor.get(u),
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <span className="font-mono text-[9px] tabular-nums text-ink-2">
                {total > 0 ? fmt(total) : ""}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-3">
                {monthLabel(m)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-2">
        {units.map((u) => (
          <span key={u} className="inline-flex items-center gap-1.5">
            <span
              className="size-3 rounded-[2px]"
              style={{ backgroundColor: unitColor.get(u) }}
            />
            <span className="text-xs text-ink-3">{u}</span>
          </span>
        ))}
        <span className="text-xs text-ink-3">
          · Projected from yield per plant × quantity, spread over each harvest window
          {cropsWithYield < crops.length
            ? ` (${crops.length - cropsWithYield} crop${crops.length - cropsWithYield === 1 ? "" : "s"} missing yield data)`
            : ""}
          .
        </span>
      </div>
    </div>
  );
}
