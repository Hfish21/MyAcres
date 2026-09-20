"use client";

import * as React from "react";
import { ArrowDownUp, Layers } from "lucide-react";

import type { Crop, Planting, Season, Space, PlantFamily } from "@/lib/garden/schema";
import { SEASONS, PLANT_FAMILIES } from "@/lib/garden/schema";
import { SEASON_ABBR, FAMILY_LABELS } from "@/lib/garden/labels";
import {
  lifecycleSegments,
  timelineWindow,
  positionPct,
  monthLabel,
  monthKey,
  seasonOfMonth,
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

// Faint orientation wash per calendar season, behind the tracks.
const SEASON_FILL: Record<Season, string> = {
  spring: "color-mix(in srgb, var(--olive) 8%, transparent)",
  summer: "color-mix(in srgb, var(--amber) 9%, transparent)",
  fall: "color-mix(in srgb, var(--ochre) 10%, transparent)",
  winter: "color-mix(in srgb, var(--inkblue) 9%, transparent)",
};

function Swatch({ stage }: { stage: LifecycleStage }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-3 rounded-[2px]", STAGE_STYLE[stage])} />
      <span className="text-xs text-ink-3">{STAGE_LABEL[stage]}</span>
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
        active
          ? "border-rust bg-rust/10 text-rust"
          : "border-line text-ink-3 hover:border-ink-3 hover:text-ink-2",
      )}
    >
      {children}
    </button>
  );
}

type SortMode = "soonest" | "name";

interface GardenTimelineProps {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
  selectedMonth: string | null;
}

export function GardenTimeline({
  plantings,
  crops,
  spaces,
  selectedMonth,
}: GardenTimelineProps) {
  const cropById = React.useMemo(() => new Map(crops.map((c) => [c.id, c])), [crops]);
  const spaceById = React.useMemo(() => new Map(spaces.map((s) => [s.id, s])), [spaces]);
  const today = new Date();

  // --- controls state ---
  const [groupByType, setGroupByType] = React.useState(true);
  const [sortMode, setSortMode] = React.useState<SortMode>("soonest");
  const [seasonFilter, setSeasonFilter] = React.useState<Set<Season>>(new Set());
  const [familyFilter, setFamilyFilter] = React.useState<Set<PlantFamily>>(new Set());
  const [soloCrop, setSoloCrop] = React.useState<string | null>(null);

  // Families actually present, so we don't show empty chips.
  const presentFamilies = React.useMemo(() => {
    const set = new Set<PlantFamily>();
    for (const p of plantings) {
      const c = cropById.get(p.cropId);
      if (c) set.add(c.family);
    }
    return PLANT_FAMILIES.filter((f) => set.has(f));
  }, [plantings, cropById]);

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  // --- filter + sort ---
  const filtered = React.useMemo(() => {
    return plantings.filter((p) => {
      const crop = cropById.get(p.cropId);
      if (!crop) return false;
      if (soloCrop && crop.name !== soloCrop) return false;
      if (familyFilter.size > 0 && !familyFilter.has(crop.family)) return false;
      if (seasonFilter.size > 0 && !crop.season.some((s) => seasonFilter.has(s)))
        return false;
      return true;
    });
  }, [plantings, cropById, soloCrop, familyFilter, seasonFilter]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortMode === "name") {
        const ca = cropById.get(a.cropId)?.name ?? "";
        const cb = cropById.get(b.cropId)?.name ?? "";
        return ca.localeCompare(cb) || a.startDate.localeCompare(b.startDate);
      }
      return a.startDate.localeCompare(b.startDate); // soonest first
    });
    return arr;
  }, [filtered, sortMode, cropById]);

  // Ordered render items: group headers interleaved with rows, or a flat list.
  type Item =
    | { kind: "group"; name: string; count: number }
    | { kind: "row"; planting: Planting };
  const items = React.useMemo<Item[]>(() => {
    if (!groupByType) return sorted.map((p) => ({ kind: "row", planting: p }));
    // Group by crop name; order groups by the group's soonest start (or name).
    const groups = new Map<string, Planting[]>();
    for (const p of sorted) {
      const name = cropById.get(p.cropId)?.name ?? "—";
      const list = groups.get(name) ?? [];
      list.push(p);
      groups.set(name, list);
    }
    const names = [...groups.keys()].sort((a, b) => {
      if (sortMode === "name") return a.localeCompare(b);
      const ea = Math.min(...groups.get(a)!.map((p) => Date.parse(p.startDate)));
      const eb = Math.min(...groups.get(b)!.map((p) => Date.parse(p.startDate)));
      return ea - eb || a.localeCompare(b);
    });
    const out: Item[] = [];
    for (const name of names) {
      const list = groups.get(name)!;
      out.push({ kind: "group", name, count: list.length });
      for (const p of list) out.push({ kind: "row", planting: p });
    }
    return out;
  }, [sorted, groupByType, cropById, sortMode]);

  const w = timelineWindow(plantings, crops);
  const monthW = 100 / w.months.length;
  const todayPct = positionPct(today, w);
  const todayInWindow = today >= w.start && today < w.end;
  const selectedIdx = w.months.findIndex((m) => monthKey(m) === selectedMonth);

  const anyFilter =
    seasonFilter.size > 0 || familyFilter.size > 0 || soloCrop !== null;

  // --- mobile agenda fallback (respects filter + sort) ---
  const agenda = (
    <ul className="flex flex-col gap-3 sm:hidden">
      {sorted.map((p) => {
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
            {items.map((it) =>
              it.kind === "group" ? (
                <button
                  key={`g-${it.name}`}
                  type="button"
                  onClick={() => setSoloCrop(soloCrop === it.name ? null : it.name)}
                  title={
                    soloCrop === it.name
                      ? "Show all crops"
                      : `Show only ${it.name}`
                  }
                  className={cn(
                    "flex h-7 w-full items-center gap-1.5 border-b border-line bg-inset/40 pr-3 text-left",
                    soloCrop === it.name && "bg-rust/10",
                  )}
                >
                  <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-2">
                    {it.name}
                  </span>
                  <span className="font-mono text-[10px] text-ink-3">×{it.count}</span>
                </button>
              ) : (
                (() => {
                  const p = it.planting;
                  const crop = cropById.get(p.cropId);
                  const space = spaceById.get(p.spaceId);
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex h-9 flex-col justify-center border-b border-line/50 pr-3",
                        groupByType && "pl-3",
                      )}
                    >
                      <div className="truncate text-sm font-medium text-ink">
                        {groupByType
                          ? crop?.variety || space?.name || crop?.name || "—"
                          : crop?.name ?? "—"}
                      </div>
                      <div className="truncate text-xs text-ink-3">{space?.name}</div>
                    </div>
                  );
                })()
              ),
            )}
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

            {/* season bands + gridlines + selected month + today (behind bars) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-7">
              {w.months.map((m, i) => (
                <div
                  key={`band-${i}`}
                  style={{
                    left: `${i * monthW}%`,
                    width: `${monthW}%`,
                    backgroundColor: SEASON_FILL[seasonOfMonth(m)],
                  }}
                  className="absolute top-0 bottom-0"
                />
              ))}
              {w.months.map((_, i) => (
                <div
                  key={`grid-${i}`}
                  style={{ left: `${i * monthW}%` }}
                  className="absolute top-0 bottom-0 border-l border-line/40"
                />
              ))}
              {selectedIdx >= 0 ? (
                <div
                  style={{ left: `${selectedIdx * monthW}%`, width: `${monthW}%` }}
                  className="absolute top-0 bottom-0 border-x border-rust bg-rust/10"
                />
              ) : null}
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
            {items.map((it) =>
              it.kind === "group" ? (
                <div
                  key={`gt-${it.name}`}
                  className="relative h-7 border-b border-line bg-inset/40"
                />
              ) : (
                (() => {
                  const p = it.planting;
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
                })()
              ),
            )}
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
      {/* controls */}
      <div className="mb-3 flex flex-col gap-2 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Chip active={groupByType} onClick={() => setGroupByType((v) => !v)}>
            <Layers className="mr-1 inline size-3" />
            Group by crop
          </Chip>
          <label className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-3">
            <ArrowDownUp className="size-3" />
            Sort
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="rounded border border-line bg-panel px-1 py-0.5 text-[11px] text-ink"
            >
              <option value="soonest">Soonest first</option>
              <option value="name">Crop name</option>
            </select>
          </label>
          {anyFilter ? (
            <button
              type="button"
              onClick={() => {
                setSeasonFilter(new Set());
                setFamilyFilter(new Set());
                setSoloCrop(null);
              }}
              className="font-mono text-[11px] uppercase tracking-wide text-rust hover:underline"
            >
              Clear filters ({sorted.length}/{plantings.length})
            </button>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
              {plantings.length} plantings
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-ink-3">
            Season
          </span>
          {SEASONS.map((s) => (
            <Chip
              key={s}
              active={seasonFilter.has(s)}
              onClick={() => setSeasonFilter((prev) => toggle(prev, s))}
            >
              {SEASON_ABBR[s]}
            </Chip>
          ))}
        </div>
        {presentFamilies.length > 1 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-ink-3">
              Family
            </span>
            {presentFamilies.map((f) => (
              <Chip
                key={f}
                active={familyFilter.has(f)}
                onClick={() => setFamilyFilter((prev) => toggle(prev, f))}
              >
                {FAMILY_LABELS[f]}
              </Chip>
            ))}
          </div>
        ) : null}
        {soloCrop ? (
          <div className="font-mono text-[11px] text-ink-3">
            Showing only <span className="text-rust">{soloCrop}</span> — click its group
            header again to show all.
          </div>
        ) : groupByType ? (
          <div className="font-mono text-[10px] text-ink-3">
            Tip: click a crop group header to filter to just that crop.
          </div>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-line py-8 text-center text-sm text-ink-3">
          No plantings match these filters.
        </div>
      ) : (
        <>
          {chart}
          {agenda}
        </>
      )}
    </>
  );
}
