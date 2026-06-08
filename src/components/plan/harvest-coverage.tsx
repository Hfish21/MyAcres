"use client";

import type { Crop, Planting } from "@/lib/garden/schema";
import { harvestCoverage, monthLabel, timelineWindow } from "@/lib/garden/insights";

interface HarvestCoverageProps {
  plantings: Planting[];
  crops: Crop[];
}

export function HarvestCoverage({ plantings, crops }: HarvestCoverageProps) {
  const { months } = timelineWindow(plantings, crops);
  const coverage = harvestCoverage(plantings, crops, months);
  const max = Math.max(1, ...coverage);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto">
        {months.map((m, i) => {
          const count = coverage[i];
          const pct = count === 0 ? 0 : 18 + (count / max) * 52; // 18–70% olive
          return (
            <div key={i} className="flex min-w-9 flex-1 flex-col items-center gap-1">
              <div
                style={{
                  backgroundColor:
                    count > 0
                      ? `color-mix(in srgb, var(--olive) ${pct}%, var(--panel))`
                      : "var(--inset)",
                }}
                className="flex h-12 w-full items-center justify-center rounded-[3px] border border-line font-mono text-sm text-ink"
                title={`${count} harvesting in ${monthLabel(m)}`}
              >
                {count > 0 ? count : ""}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-3">
                {monthLabel(m)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-3">
        Plantings in harvest each month — pale months are gaps in your supply.
      </p>
    </div>
  );
}
