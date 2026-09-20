"use client";

import * as React from "react";

import type { Crop, Planting, Space } from "@/lib/garden/schema";
import {
  harvestCoverage,
  harvestingInMonth,
  monthKey,
  monthLabel,
  timelineWindow,
} from "@/lib/garden/insights";
import { cn } from "@/lib/utils";

interface HarvestCoverageProps {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
  selectedMonth: string | null;
  onSelectMonth: (key: string | null) => void;
}

export function HarvestCoverage({
  plantings,
  crops,
  spaces,
  selectedMonth,
  onSelectMonth,
}: HarvestCoverageProps) {
  const { months } = timelineWindow(plantings, crops);
  const coverage = harvestCoverage(plantings, crops, months);
  const max = Math.max(1, ...coverage);
  const spaceById = React.useMemo(
    () => new Map(spaces.map((s) => [s.id, s])),
    [spaces],
  );

  const selected = months.find((m) => monthKey(m) === selectedMonth) ?? null;
  const detail = selected ? harvestingInMonth(plantings, crops, selected) : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto">
        {months.map((m, i) => {
          const count = coverage[i];
          const key = monthKey(m);
          const isSelected = key === selectedMonth;
          const pct = count === 0 ? 0 : 18 + (count / max) * 52; // 18–70% olive
          return (
            <div key={i} className="flex min-w-9 flex-1 flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectMonth(isSelected ? null : key)}
                style={{
                  backgroundColor:
                    count > 0
                      ? `color-mix(in srgb, var(--olive) ${pct}%, var(--panel))`
                      : "var(--inset)",
                }}
                aria-pressed={isSelected}
                title={`${count} harvesting in ${monthLabel(m)} — click to see them`}
                className={cn(
                  "flex h-12 w-full cursor-pointer items-center justify-center rounded-[3px] border font-mono text-sm text-ink transition-[outline]",
                  isSelected
                    ? "border-rust outline outline-2 outline-rust"
                    : "border-line hover:border-ink-3",
                )}
              >
                {count > 0 ? count : ""}
              </button>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wide",
                  isSelected ? "text-rust" : "text-ink-3",
                )}
              >
                {monthLabel(m)}
              </span>
            </div>
          );
        })}
      </div>

      {selected ? (
        <div className="rounded-md border border-line bg-inset/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-wide text-ink-2">
              In harvest ·{" "}
              {selected.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button
              type="button"
              onClick={() => onSelectMonth(null)}
              className="font-mono text-[10px] uppercase tracking-wide text-ink-3 hover:text-rust"
            >
              Clear
            </button>
          </div>
          {detail.length === 0 ? (
            <p className="text-xs text-ink-3">Nothing in harvest this month — a supply gap.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {detail.map(({ planting, crop }) => (
                <li
                  key={planting.id}
                  className="flex items-baseline justify-between gap-2 text-sm"
                >
                  <span className="text-ink">
                    {crop.name}
                    {crop.variety ? (
                      <span className="text-ink-3"> · {crop.variety}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-3">
                    {spaceById.get(planting.spaceId)?.name ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-3">
          Plantings in harvest each month — pale months are gaps in your supply. Click a
          month to see what&apos;s ready and mark it on the timeline.
        </p>
      )}
    </div>
  );
}
