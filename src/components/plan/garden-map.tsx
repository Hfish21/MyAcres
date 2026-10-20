"use client";

import * as React from "react";
import { Tag } from "lucide-react";

import type { Crop, Planting, PlantFamily, Season, Space } from "@/lib/garden/schema";
import { PLANT_FAMILIES, SEASONS } from "@/lib/garden/schema";
import { FAMILY_LABELS, SEASON_ABBR } from "@/lib/garden/labels";
import { cropColorMap, cropLabel, familyColor } from "@/lib/garden/colors";
import { addMonths, plantingActiveOn, startOfMonth, timelineWindow } from "@/lib/garden/insights";
import { GardenCanvas } from "@/components/layout/garden-canvas";
import { Chip } from "./chip";
import { DateScrubber } from "./date-scrubber";

// The Garden Map: the layout canvas, read-only, scrubbable across the season and
// filterable by season, family, or a single crop. Clicking a crop's block (or its
// legend entry) spotlights it everywhere it's planted. Layout stays the editor and
// shows today; this is where you watch the garden fill and empty.

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

const noop = () => {};

export function GardenMap({
  plantings,
  crops,
  spaces,
  selectedMonth,
}: {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
  /** "YYYY-MM" picked elsewhere on the Plan page; jumps the map to mid-month. */
  selectedMonth: string | null;
}) {
  const cropColors = React.useMemo(() => cropColorMap(crops), [crops]);
  const cropById = React.useMemo(() => new Map(crops.map((c) => [c.id, c])), [crops]);
  const win = React.useMemo(() => timelineWindow(plantings, crops), [plantings, crops]);

  const [asOf, setAsOf] = React.useState(() => new Date());
  const [showNames, setShowNames] = React.useState(false);
  const [seasonFilter, setSeasonFilter] = React.useState<Set<Season>>(new Set());
  const [familyFilter, setFamilyFilter] = React.useState<Set<PlantFamily>>(new Set());
  const [cropFilter, setCropFilter] = React.useState("");
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const toggleHighlight = React.useCallback(
    (id: string) => setHighlightId((cur) => (cur === id ? null : id)),
    [],
  );

  // Follow the Plan page's month selection (harvest strip / crop grid clicks).
  React.useEffect(() => {
    if (!selectedMonth) return;
    const [y, m] = selectedMonth.split("-").map(Number);
    if (!y || !m) return;
    const first = new Date(y, m - 1, 1);
    setAsOf(new Date((startOfMonth(first).getTime() + addMonths(first, 1).getTime()) / 2));
  }, [selectedMonth]);

  const presentFamilies = React.useMemo(() => {
    const seen = new Set<PlantFamily>();
    for (const p of plantings) {
      const c = cropById.get(p.cropId);
      if (c) seen.add(c.family);
    }
    return PLANT_FAMILIES.filter((f) => seen.has(f));
  }, [plantings, cropById]);

  const cropNames = React.useMemo(() => {
    const seen = new Set<string>();
    for (const p of plantings) {
      const c = cropById.get(p.cropId);
      if (c) seen.add(c.name);
    }
    return [...seen].sort();
  }, [plantings, cropById]);

  const visible = React.useMemo(
    () =>
      plantings.filter((p) => {
        const c = cropById.get(p.cropId);
        if (!c) return false;
        if (cropFilter && c.name !== cropFilter) return false;
        if (familyFilter.size > 0 && !familyFilter.has(c.family)) return false;
        if (seasonFilter.size > 0 && !c.season.some((s) => seasonFilter.has(s))) return false;
        return true;
      }),
    [plantings, cropById, cropFilter, familyFilter, seasonFilter],
  );

  // Legend: crops actually in the ground on the scrubbed date.
  const activeCrops = React.useMemo(() => {
    const ids = new Set<string>();
    for (const p of visible) {
      const c = cropById.get(p.cropId);
      if (c && plantingActiveOn(p, c, asOf)) ids.add(c.id);
    }
    return [...ids]
      .map((id) => cropById.get(id)!)
      .sort((a, b) => a.family.localeCompare(b.family) || cropLabel(a).localeCompare(cropLabel(b)));
  }, [visible, cropById, asOf]);

  const filtered = seasonFilter.size > 0 || familyFilter.size > 0 || cropFilter !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
          <span className="ml-2 mr-1 font-mono text-[10px] uppercase tracking-wide text-ink-3">
            Crop
          </span>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="rounded border border-line bg-panel px-1 py-0.5 text-[11px] text-ink"
          >
            <option value="">All crops</option>
            {cropNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Chip active={showNames} onClick={() => setShowNames((v) => !v)}>
            <Tag className="mr-1 inline size-3" />
            Names
          </Chip>
          {filtered ? (
            <button
              type="button"
              onClick={() => {
                setSeasonFilter(new Set());
                setFamilyFilter(new Set());
                setCropFilter("");
              }}
              className="font-mono text-[11px] uppercase tracking-wide text-rust hover:underline"
            >
              Clear
            </button>
          ) : null}
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
                <span
                  aria-hidden
                  className="mr-1 inline-block size-2 rounded-full align-middle"
                  style={{ backgroundColor: familyColor(f) }}
                />
                {FAMILY_LABELS[f]}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      <GardenCanvas
        spaces={spaces}
        plantings={visible}
        crops={crops}
        cropColors={cropColors}
        asOfDate={asOf}
        mode="select"
        editable={false}
        showAllNames={showNames}
        showSun={false}
        selectedId={null}
        draftPoints={[]}
        onSelect={() => setHighlightId(null)}
        onAddDraftPoint={noop}
        onCloseDraft={noop}
        onMoveSpace={noop}
        highlightCropId={highlightId}
        onBlockClick={toggleHighlight}
      />

      <DateScrubber
        start={win.start}
        end={win.end}
        value={asOf}
        onChange={setAsOf}
        crops={activeCrops}
        cropColors={cropColors}
        highlightId={highlightId}
        onCropClick={toggleHighlight}
      />
    </div>
  );
}
