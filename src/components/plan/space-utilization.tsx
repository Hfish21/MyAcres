"use client";

import * as React from "react";

import type { Crop, Planting, Space } from "@/lib/garden/schema";
import { monthLabel, spaceUtilization, timelineWindow } from "@/lib/garden/insights";

interface SpaceUtilizationProps {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
}

// How full the garden is each month — % of total growing area occupied. Low
// months reveal empty capacity you could still plant into.
export function SpaceUtilization({ plantings, crops, spaces }: SpaceUtilizationProps) {
  const { months } = timelineWindow(plantings, crops);
  const util = React.useMemo(
    () => spaceUtilization(plantings, crops, spaces, months),
    [plantings, crops, spaces, months],
  );

  if (spaces.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line py-8 text-center text-sm text-ink-3">
        No spaces defined.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1 overflow-x-auto">
        {months.map((m, i) => {
          const pct = Math.round(util[i] * 100);
          return (
            <div key={i} className="flex min-w-9 flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-[3px] bg-olive/70"
                  style={{ height: `${Math.max(util[i] * 100, pct > 0 ? 3 : 0)}%` }}
                  title={`${monthLabel(m)}: ${pct}% of growing area occupied`}
                />
              </div>
              <span className="font-mono text-[9px] tabular-nums text-ink-2">
                {pct > 0 ? `${pct}%` : ""}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-3">
                {monthLabel(m)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-3">
        Share of your total growing area in use each month. Low bars are open capacity you
        could still plant into.
      </p>
    </div>
  );
}
