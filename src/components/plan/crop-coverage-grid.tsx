"use client";

import * as React from "react";

import type { Crop, Planting } from "@/lib/garden/schema";
import {
  cropCoverageGrid,
  monthKey,
  monthLabel,
  timelineWindow,
} from "@/lib/garden/insights";
import { cn } from "@/lib/utils";

interface CropCoverageGridProps {
  plantings: Planting[];
  crops: Crop[];
  selectedMonth: string | null;
  onSelectMonth: (key: string | null) => void;
}

// A vegetable × month matrix: cell filled = that crop is in harvest that month.
// Reveals per-crop gaps (e.g. lettuce Oct–Jan but a Feb hole) the aggregate hides.
export function CropCoverageGrid({
  plantings,
  crops,
  selectedMonth,
  onSelectMonth,
}: CropCoverageGridProps) {
  const { months } = timelineWindow(plantings, crops);
  const rows = React.useMemo(
    () => cropCoverageGrid(plantings, crops, months),
    [plantings, crops, months],
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line py-8 text-center text-sm text-ink-3">
        No harvests projected.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-panel px-2 py-1 text-left font-mono text-[10px] uppercase tracking-wide text-ink-3">
              Crop
            </th>
            {months.map((m, i) => {
              const key = monthKey(m);
              const isSel = key === selectedMonth;
              return (
                <th key={i} className="px-0.5 py-1">
                  <button
                    type="button"
                    onClick={() => onSelectMonth(isSel ? null : key)}
                    aria-pressed={isSel}
                    className={cn(
                      "w-full rounded-[2px] px-1 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                      isSel ? "bg-rust/10 text-rust" : "text-ink-3 hover:text-ink-2",
                    )}
                  >
                    {monthLabel(m)}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cropName} className="border-t border-line/50">
              <td className="sticky left-0 z-10 bg-panel px-2 py-1 text-ink">
                <span className="truncate">{row.cropName}</span>
              </td>
              {row.months.map((on, i) => {
                const isSel = monthKey(months[i]) === selectedMonth;
                return (
                  <td key={i} className="px-0.5 py-0.5">
                    <div
                      title={`${row.cropName} · ${monthLabel(months[i])}: ${on ? "in harvest" : "—"}`}
                      className={cn(
                        "h-5 w-full rounded-[2px] border",
                        on
                          ? "border-amber/50 bg-amber/70"
                          : "border-transparent bg-inset/50",
                        isSel && "ring-1 ring-rust",
                      )}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 px-2 text-xs text-ink-3">
        Amber = that crop is in harvest that month. Empty cells across a row are gaps for
        that crop. Click a month header to mark it on the timeline.
      </p>
    </div>
  );
}
