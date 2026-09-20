import type { Crop, Planting, PlantingStatus, Season, Space } from "./schema";
import { polygonArea } from "./geometry";
import { projectedDates } from "./schedule";

// Derivations for the Plan view (the visual garden-over-time insights). All pure,
// all built from projectedDates(); nothing is stored.

export type LifecycleStage = "establish" | "growing" | "harvest";

export interface LifecycleSegment {
  stage: LifecycleStage;
  start: Date;
  end: Date;
}

// --- date utils -----------------------------------------------------------

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short" });
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function cropMap(crops: Crop[]): Map<string, Crop> {
  return new Map(crops.map((c) => [c.id, c]));
}

// --- lifecycle segments (the timeline bar) --------------------------------

/**
 * Three continuous segments for a planting's bar: establish (sow → germinate or
 * → transplant), growing (→ first harvest), harvest (→ end of harvest window).
 * Uses the earliest edge of each window so the bar reads as a clean timeline;
 * tooltips can show the full ranges.
 */
export function lifecycleSegments(planting: Planting, crop: Crop): LifecycleSegment[] {
  const sched = projectedDates(planting, crop);
  if (!sched) return [];

  const start = new Date(planting.startDate);
  const establishEnd = sched.transplant
    ? sched.transplant.earliest
    : sched.germination.latest;
  const harvestStart = sched.firstHarvest.earliest;
  const harvestEnd = sched.harvestEnd?.latest ?? sched.firstHarvest.latest;

  // Keep boundaries monotonic even if a crop's numbers are unusual.
  const p1 = new Date(Math.max(start.getTime(), establishEnd.getTime()));
  const p2 = new Date(Math.max(p1.getTime(), harvestStart.getTime()));
  const p3 = new Date(Math.max(p2.getTime(), harvestEnd.getTime()));

  return [
    { stage: "establish", start, end: p1 },
    { stage: "growing", start: p1, end: p2 },
    { stage: "harvest", start: p2, end: p3 },
  ];
}

/** The full occupied span (sow → end of harvest) of a planting, or null. */
export function plantingSpan(planting: Planting, crop: Crop): { start: Date; end: Date } | null {
  const segs = lifecycleSegments(planting, crop);
  if (segs.length === 0) return null;
  return { start: segs[0].start, end: segs[segs.length - 1].end };
}

/** Is the planting occupying its space on the given date? (powers the scrubber.) */
export function plantingActiveOn(planting: Planting, crop: Crop, date: Date): boolean {
  const span = plantingSpan(planting, crop);
  if (!span) return false;
  return date >= span.start && date <= span.end;
}

/**
 * Which lifecycle stage a planting is in on a given date, or null if it isn't in
 * the ground then. Powers the maturing plant glyphs on the layout canvas — drag
 * the scrubber and plants grow establish → growing → harvest.
 */
export function stageOn(planting: Planting, crop: Crop, date: Date): LifecycleStage | null {
  const segs = lifecycleSegments(planting, crop);
  if (segs.length === 0) return null;
  const t = date.getTime();
  if (t < segs[0].start.getTime()) return null;
  for (const seg of segs) {
    if (t <= seg.end.getTime()) return seg.stage;
  }
  return null; // past the end of the harvest window
}

// --- timeline window ------------------------------------------------------

export interface TimelineWindow {
  start: Date; // start of first month
  end: Date; // start of month AFTER the last (exclusive)
  months: Date[]; // start-of-month for each column
}

export function timelineWindow(plantings: Planting[], crops: Crop[]): TimelineWindow {
  const byId = cropMap(crops);
  const dates: number[] = [];
  for (const p of plantings) {
    const crop = byId.get(p.cropId);
    if (!crop) continue;
    for (const seg of lifecycleSegments(p, crop)) {
      dates.push(seg.start.getTime(), seg.end.getTime());
    }
  }

  let start: Date;
  let lastMonth: Date;
  if (dates.length === 0) {
    const now = new Date();
    start = new Date(now.getFullYear(), 0, 1);
    lastMonth = new Date(now.getFullYear(), 11, 1);
  } else {
    start = startOfMonth(new Date(Math.min(...dates)));
    lastMonth = startOfMonth(new Date(Math.max(...dates)));
  }
  const end = addMonths(lastMonth, 1);

  const months: Date[] = [];
  for (let m = start; m < end; m = addMonths(m, 1)) months.push(m);
  return { start, end, months };
}

/** Horizontal position of a date within the window, as a percentage (0–100). */
export function positionPct(date: Date, w: TimelineWindow): number {
  const span = w.end.getTime() - w.start.getTime();
  if (span <= 0) return 0;
  return clamp(((date.getTime() - w.start.getTime()) / span) * 100, 0, 100);
}

// --- harvest coverage -----------------------------------------------------

/** For each month in the window, how many plantings are in their harvest window. */
export function harvestCoverage(
  plantings: Planting[],
  crops: Crop[],
  months: Date[],
): number[] {
  const byId = cropMap(crops);
  const harvestRanges: Array<[number, number]> = [];
  for (const p of plantings) {
    const crop = byId.get(p.cropId);
    if (!crop) continue;
    const seg = lifecycleSegments(p, crop).find((s) => s.stage === "harvest");
    if (seg) harvestRanges.push([seg.start.getTime(), seg.end.getTime()]);
  }

  return months.map((m) => {
    const monthStart = m.getTime();
    const monthEnd = addMonths(m, 1).getTime();
    return harvestRanges.filter(([s, e]) => s < monthEnd && e >= monthStart).length;
  });
}

// --- upcoming milestones --------------------------------------------------

export type MilestoneKind = "sow" | "transplant" | "harvest";

export interface Milestone {
  date: Date;
  kind: MilestoneKind;
  overdue: boolean;
  planting: Planting;
  crop: Crop;
}

const REACHED: Record<MilestoneKind, PlantingStatus[]> = {
  sow: ["started", "transplanted", "growing", "harvesting", "done"],
  transplant: ["transplanted", "growing", "harvesting", "done"],
  harvest: ["harvesting", "done"],
};

/** Pending milestones across all plantings, soonest first; past-due flagged. */
export function upcomingMilestones(
  plantings: Planting[],
  crops: Crop[],
  today: Date = new Date(),
): Milestone[] {
  const byId = cropMap(crops);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const out: Milestone[] = [];

  for (const p of plantings) {
    if (p.status === "done" || p.status === "failed") continue;
    const crop = byId.get(p.cropId);
    if (!crop) continue;
    const sched = projectedDates(p, crop);
    if (!sched) continue;

    const candidates: Array<{ kind: MilestoneKind; date: Date } | null> = [
      { kind: "sow", date: new Date(p.startDate) },
      crop.plantingMethod === "transplant" && sched.transplant
        ? { kind: "transplant", date: sched.transplant.earliest }
        : null,
      { kind: "harvest", date: sched.firstHarvest.earliest },
    ];

    for (const c of candidates) {
      if (!c) continue;
      if (REACHED[c.kind].includes(p.status)) continue; // already done
      out.push({
        date: c.date,
        kind: c.kind,
        overdue: c.date < todayStart,
        planting: p,
        crop,
      });
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const MILESTONE_LABELS: Record<MilestoneKind, string> = {
  sow: "Sow",
  transplant: "Transplant",
  harvest: "Harvest begins",
};

// --- month <-> planting crossfilter (harvest-coverage ↔ timeline) ---------

/** Stable key for a month column (`YYYY-MM`), used to select/compare months. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Does the harvest window of `planting` overlap the calendar month `m`? */
function harvestOverlapsMonth(planting: Planting, crop: Crop, m: Date): boolean {
  const seg = lifecycleSegments(planting, crop).find((s) => s.stage === "harvest");
  if (!seg) return false;
  const monthStart = m.getTime();
  const monthEnd = addMonths(m, 1).getTime();
  return seg.start.getTime() < monthEnd && seg.end.getTime() >= monthStart;
}

/** The plantings in their harvest window during month `m`, with their crop. */
export function harvestingInMonth(
  plantings: Planting[],
  crops: Crop[],
  m: Date,
): Array<{ planting: Planting; crop: Crop }> {
  const byId = cropMap(crops);
  const out: Array<{ planting: Planting; crop: Crop }> = [];
  for (const p of plantings) {
    const crop = byId.get(p.cropId);
    if (!crop) continue;
    if (harvestOverlapsMonth(p, crop, m)) out.push({ planting: p, crop });
  }
  return out;
}

// --- per-crop-type harvest coverage grid ----------------------------------

export interface CropCoverageRow {
  cropName: string; // grouping key = the vegetable (crop.name)
  family: Crop["family"];
  months: boolean[]; // aligned to the window's months: in harvest that month?
  total: number; // months in harvest (for sorting)
}

/** One row per distinct crop name, marking which months it's in harvest. */
export function cropCoverageGrid(
  plantings: Planting[],
  crops: Crop[],
  months: Date[],
): CropCoverageRow[] {
  const byId = cropMap(crops);
  const rows = new Map<string, CropCoverageRow>();
  for (const p of plantings) {
    const crop = byId.get(p.cropId);
    if (!crop) continue;
    let row = rows.get(crop.name);
    if (!row) {
      row = {
        cropName: crop.name,
        family: crop.family,
        months: months.map(() => false),
        total: 0,
      };
      rows.set(crop.name, row);
    }
    months.forEach((m, i) => {
      if (!row!.months[i] && harvestOverlapsMonth(p, crop, m)) row!.months[i] = true;
    });
  }
  for (const row of rows.values()) row.total = row.months.filter(Boolean).length;
  return [...rows.values()].sort((a, b) => a.cropName.localeCompare(b.cropName));
}

// --- projected food production per month -----------------------------------

/** Per-month projected yield, aggregated by unit (spread over harvest window). */
export function yieldByMonth(
  plantings: Planting[],
  crops: Crop[],
  months: Date[],
): Array<Map<string, number>> {
  const byId = cropMap(crops);
  const out: Array<Map<string, number>> = months.map(() => new Map());
  for (const p of plantings) {
    const crop = byId.get(p.cropId);
    if (!crop || !crop.yieldPerPlant) continue;
    const seg = lifecycleSegments(p, crop).find((s) => s.stage === "harvest");
    if (!seg) continue;
    const unit = crop.yieldUnit?.trim() || "units";
    const perPlant = (crop.yieldPerPlant.min + crop.yieldPerPlant.max) / 2;
    const total = perPlant * p.quantity;
    const spanMs = seg.end.getTime() - seg.start.getTime();
    if (spanMs <= 0) {
      // Single-shot harvest: attribute all to the starting month.
      const i = months.findIndex(
        (m) => seg.start.getTime() >= m.getTime() && seg.start.getTime() < addMonths(m, 1).getTime(),
      );
      if (i >= 0) out[i].set(unit, (out[i].get(unit) ?? 0) + total);
      continue;
    }
    // Spread the total evenly across the harvest window by days-in-month overlap.
    months.forEach((m, i) => {
      const monthStart = m.getTime();
      const monthEnd = addMonths(m, 1).getTime();
      const lo = Math.max(seg.start.getTime(), monthStart);
      const hi = Math.min(seg.end.getTime(), monthEnd);
      if (hi <= lo) return;
      const share = ((hi - lo) / spanMs) * total;
      out[i].set(unit, (out[i].get(unit) ?? 0) + share);
    });
  }
  return out;
}

// --- space utilization over time -------------------------------------------

/** Fraction (0–1) of total growing area occupied by a planting each month. */
export function spaceUtilization(
  plantings: Planting[],
  crops: Crop[],
  spaces: Space[],
  months: Date[],
): number[] {
  const byId = cropMap(crops);
  const spaceById = new Map(spaces.map((s) => [s.id, s]));
  const totalArea = spaces.reduce((sum, s) => sum + polygonArea(s.shape), 0);
  if (totalArea <= 0) return months.map(() => 0);

  return months.map((m) => {
    const mid = new Date((m.getTime() + addMonths(m, 1).getTime()) / 2);
    const occupied = new Set<string>();
    for (const p of plantings) {
      const crop = byId.get(p.cropId);
      if (!crop) continue;
      if (plantingActiveOn(p, crop, mid)) occupied.add(p.spaceId);
    }
    let area = 0;
    for (const id of occupied) {
      const s = spaceById.get(id);
      if (s) area += polygonArea(s.shape);
    }
    return clamp(area / totalArea, 0, 1);
  });
}

// --- season bands (calendar → meteorological season) ----------------------

/** Northern-hemisphere season for a month, for orientation bands on the timeline. */
export function seasonOfMonth(m: Date): Season {
  const mo = m.getMonth(); // 0-11
  if (mo <= 1 || mo === 11) return "winter"; // Dec, Jan, Feb
  if (mo <= 4) return "spring"; // Mar–May
  if (mo <= 7) return "summer"; // Jun–Aug
  return "fall"; // Sep–Nov
}
