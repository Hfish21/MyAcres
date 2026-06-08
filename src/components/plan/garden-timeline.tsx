"use client";

import * as React from "react";

import type { Crop, Planting, Space } from "@/lib/garden/schema";
import {
  lifecycleSegments,
  timelineWindow,
  positionPct,
  monthLabel,
  type LifecycleStage,
} from "@/lib/garden/insights";
import { projectedDates, fmtDate, fmtDateRange } from "@/lib/garden/schedule";
import { cn } from "@/lib/utils";

const STAGE_STYLE: Record<LifecycleStage, string> = {
  establish: "bg-olive/25 border border-olive/40",
  growing: "bg-olive border border-olive",
  harvest: "bg-amber border border-amber",
};
const STAGE_LABEL: Record<LifecycleStage, string> = {
  establish: "Establish",
  growing: "Growing",
  harvest: "Harvest",
};

function Swatch({ stage }: { stage: LifecycleStage }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-3 rounded-[2px]", STAGE_STYLE[stage])} />
      <span className="text-xs text-ink-3">{STAGE_LABEL[stage]}</span>
    </span>
  );
}

interface GardenTimelineProps {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
}

export function GardenTimeline({ plantings, crops, spaces }: GardenTimelineProps) {
  const cropById = React.useMemo(() => new Map(crops.map((c) => [c.id, c])), [crops]);
  const spaceById = React.useMemo(() => new Map(spaces.map((s) => [s.id, s])), [spaces]);
  const today = new Date();

  const w = timelineWindow(plantings, crops);
  const monthW = 100 / w.months.length;
  const todayPct = positionPct(today, w);
  const todayInWindow = today >= w.start && today < w.end;

  // --- mobile agenda fallback ---
  const agenda = (
    <ul className="flex flex-col gap-3 sm:hidden">
      {plantings.map((p) => {
        const crop = cropById.get(p.cropId);
        const space = spaceById.get(p.spaceId);
        const s = crop ? projectedDates(p, crop) : null;
        return (
          <li key={p.id} className="border-b border-line/60 pb-3 last:border-b-0">
            <div className="font-medium text-ink">
              {crop?.name ?? "—"}
              {crop?.variety ? <span className="text-ink-3"> · {crop.variety}</span> : null}
            </div>
            <div className="text-xs text-ink-3">{space?.name}</div>
            {s ? (
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 font-mono text-xs text-ink-2">
                <dt>Sow</dt>
                <dd className="text-ink">{fmtDate(new Date(p.startDate))}</dd>
                {s.transplant ? (
                  <>
                    <dt>Transplant</dt>
                    <dd className="text-ink">{fmtDateRange(s.transplant)}</dd>
                  </>
                ) : null}
                <dt>Harvest</dt>
                <dd className="text-ink">
                  {fmtDate(s.firstHarvest.earliest)} –{" "}
                  {fmtDate(s.harvestEnd?.latest ?? s.firstHarvest.latest)}
                </dd>
              </dl>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  // --- desktop chart ---
  const chart = (
    <div className="hidden sm:block">
      <div className="overflow-x-auto">
        <div className="flex min-w-[680px]">
          {/* label column */}
          <div className="w-44 shrink-0">
            <div className="h-7 border-b border-line" />
            {plantings.map((p) => {
              const crop = cropById.get(p.cropId);
              const space = spaceById.get(p.spaceId);
              return (
                <div
                  key={p.id}
                  className="flex h-9 flex-col justify-center border-b border-line/50 pr-3"
                >
                  <div className="truncate text-sm font-medium text-ink">
                    {crop?.name ?? "—"}
                  </div>
                  <div className="truncate text-xs text-ink-3">{space?.name}</div>
                </div>
              );
            })}
          </div>

          {/* tracks column */}
          <div className="relative flex-1">
            {/* month header */}
            <div className="flex h-7">
              {w.months.map((m, i) => (
                <div
                  key={i}
                  style={{ width: `${monthW}%` }}
                  className="border-l border-line font-mono text-[10px] uppercase tracking-wide text-ink-3"
                >
                  <span className="px-1">
                    {monthLabel(m)}
                    {m.getMonth() === 0 || i === 0
                      ? ` '${String(m.getFullYear()).slice(2)}`
                      : ""}
                  </span>
                </div>
              ))}
            </div>

            {/* gridlines + today overlay (behind bars) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-7">
              {w.months.map((_, i) => (
                <div
                  key={i}
                  style={{ left: `${i * monthW}%` }}
                  className="absolute top-0 bottom-0 border-l border-line/40"
                />
              ))}
              {todayInWindow ? (
                <div
                  style={{ left: `${todayPct}%` }}
                  className="absolute top-0 bottom-0 w-px bg-inkblue"
                >
                  <span className="absolute -top-[18px] -translate-x-1/2 font-mono text-[9px] uppercase text-inkblue">
                    Today
                  </span>
                </div>
              ) : null}
            </div>

            {/* rows */}
            {plantings.map((p) => {
              const crop = cropById.get(p.cropId);
              const segs = crop ? lifecycleSegments(p, crop) : [];
              return (
                <div key={p.id} className="relative h-9 border-b border-line/50">
                  {segs.map((seg, i) => {
                    const left = positionPct(seg.start, w);
                    const width = positionPct(seg.end, w) - left;
                    if (width <= 0) return null;
                    return (
                      <div
                        key={i}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundImage:
                            seg.stage === "harvest"
                              ? "repeating-linear-gradient(45deg, rgba(28,26,23,0) 0 4px, rgba(28,26,23,0.12) 4px 5px)"
                              : undefined,
                        }}
                        title={`${STAGE_LABEL[seg.stage]}: ${fmtDate(seg.start)} – ${fmtDate(seg.end)}`}
                        className={cn(
                          "absolute top-2 h-5 rounded-[3px]",
                          STAGE_STYLE[seg.stage],
                        )}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-2">
        <Swatch stage="establish" />
        <Swatch stage="growing" />
        <Swatch stage="harvest" />
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-px bg-inkblue" />
          <span className="text-xs text-ink-3">Today</span>
        </span>
      </div>
    </div>
  );

  return (
    <>
      {chart}
      {agenda}
    </>
  );
}
