"use client";

import type { Crop, Season } from "@/lib/garden/schema";
import { cropLabel } from "@/lib/garden/colors";
import { addMonths, seasonOfMonth, startOfMonth } from "@/lib/garden/insights";
import { fmtDate } from "@/lib/garden/schedule";
import { cn } from "@/lib/utils";

const DAY = 86400000;

// Faint season bands under the slider, so "where in the year am I" reads at a glance.
const SEASON_TINT: Record<Season, string> = {
  spring: "color-mix(in srgb, var(--olive) 22%, transparent)",
  summer: "color-mix(in srgb, var(--amber) 22%, transparent)",
  fall: "color-mix(in srgb, var(--ochre) 26%, transparent)",
  winter: "color-mix(in srgb, var(--inkblue) 22%, transparent)",
};
const MONTH_INITIAL = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Month ticks + season bands aligned to the range input, with a "today" caret.
// Season boundaries get a taller tick; month initials drop out on long ranges.
function SeasonTicks({ start, end }: { start: Date; end: Date }) {
  const span = end.getTime() - start.getTime();
  if (span <= 0) return null;
  const pct = (d: Date) => ((d.getTime() - start.getTime()) / span) * 100;
  const months: Date[] = [];
  for (let m = startOfMonth(start); m < end; m = addMonths(m, 1)) months.push(m);
  const showInitials = months.length <= 20;
  const today = new Date();
  const todayInRange = today >= start && today <= end;

  return (
    <div className="relative mt-1 h-5 select-none" aria-hidden>
      {months.map((m, i) => {
        const a = pct(m);
        const b = pct(addMonths(m, 1));
        return (
          <div
            key={`s-${i}`}
            className="absolute inset-y-0 top-0 h-2.5"
            style={{
              left: `${Math.max(0, a)}%`,
              width: `${Math.min(100, b) - Math.max(0, a)}%`,
              backgroundColor: SEASON_TINT[seasonOfMonth(m)],
            }}
          />
        );
      })}
      {months.map((m, i) => {
        const a = pct(m);
        if (a < 0 || a > 100) return null;
        const season = seasonOfMonth(m);
        const boundary = i === 0 || seasonOfMonth(months[i - 1]) !== season;
        return (
          <div key={`t-${i}`} className="absolute top-0" style={{ left: `${a}%` }}>
            <div className={cn("w-px", boundary ? "h-2.5 bg-ink-3" : "h-1.5 bg-line")} />
            {showInitials ? (
              <span className="absolute left-0 top-2.5 -translate-x-1/2 font-mono text-[8px] text-ink-3">
                {MONTH_INITIAL[m.getMonth()]}
              </span>
            ) : null}
          </div>
        );
      })}
      {todayInRange ? (
        <div
          className="absolute top-0 z-10 h-3 w-px bg-inkblue"
          style={{ left: `${pct(today)}%` }}
        >
          <span className="absolute -top-[9px] left-0 -translate-x-1/2 font-mono text-[8px] uppercase text-inkblue">
            ▾
          </span>
        </div>
      ) : null}
    </div>
  );
}

interface DateScrubberProps {
  start: Date;
  end: Date;
  value: Date;
  onChange: (d: Date) => void;
  crops: Crop[];
  cropColors: Map<string, string>;
  /** The crop currently spotlighted (its legend entry stays bright). */
  highlightId?: string | null;
  /** When set, legend entries become toggle buttons that report their crop id. */
  onCropClick?: (cropId: string) => void;
}

export function DateScrubber({
  start,
  end,
  value,
  onChange,
  crops,
  cropColors,
  highlightId,
  onCropClick,
}: DateScrubberProps) {
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY));
  const offset = Math.round((value.getTime() - start.getTime()) / DAY);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 font-mono text-xs uppercase tracking-wide text-ink-3">
          As of
        </span>
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={totalDays}
            value={Math.min(Math.max(offset, 0), totalDays)}
            onChange={(e) => onChange(new Date(start.getTime() + Number(e.target.value) * DAY))}
            className="h-1 w-full accent-rust"
          />
          <SeasonTicks start={start} end={end} />
        </div>
        <span className="mt-0.5 w-28 shrink-0 text-right font-mono text-sm tabular-nums text-ink">
          {`${fmtDate(value)} '${String(value.getFullYear()).slice(2)}`}
        </span>
      </div>
      {crops.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {crops.map((c) => {
            const lit = highlightId === c.id;
            const body = (
              <>
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: cropColors.get(c.id) }}
                />
                <span className={cn("text-xs", lit ? "font-medium text-ink" : "text-ink-3")}>
                  {cropLabel(c)}
                </span>
              </>
            );
            return onCropClick ? (
              <button
                key={c.id}
                type="button"
                onClick={() => onCropClick(c.id)}
                aria-pressed={lit}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-1 -mx-1 transition-opacity hover:bg-inset/60",
                  highlightId != null && !lit && "opacity-45",
                )}
              >
                {body}
              </button>
            ) : (
              <span key={c.id} className="inline-flex items-center gap-1.5">
                {body}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
