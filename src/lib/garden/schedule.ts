import type { Crop, Planting, Range } from "./schema";

// Projected schedule (ADR-0009): derive a planting's lifecycle date windows from
// its start date + the crop's timing. Predictions only — never stored.

export interface DateRange {
  earliest: Date;
  latest: Date;
}

export interface ProjectedSchedule {
  germination: DateRange;
  transplant?: DateRange; // transplant crops only
  firstHarvest: DateRange;
  harvestEnd?: DateRange; // when a harvest window is defined
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function rangeFrom(base: DateRange | Date, days: Range): DateRange {
  const earliestBase = base instanceof Date ? base : base.earliest;
  const latestBase = base instanceof Date ? base : base.latest;
  return {
    earliest: addDays(earliestBase, days.min),
    latest: addDays(latestBase, days.max),
  };
}

/** Returns the projected windows, or null if the start date is unusable. */
export function projectedDates(
  planting: Pick<Planting, "startDate">,
  crop: Crop,
): ProjectedSchedule | null {
  const start = new Date(planting.startDate);
  if (Number.isNaN(start.getTime())) return null;

  const germination = rangeFrom(start, crop.daysToGerminate);

  // Harvest counts from transplant for transplant crops, else from sowing.
  let harvestAnchor: DateRange | Date = start;
  let transplant: DateRange | undefined;
  if (crop.plantingMethod === "transplant" && crop.daysToTransplant) {
    transplant = rangeFrom(start, crop.daysToTransplant);
    harvestAnchor = transplant;
  }

  const firstHarvest = rangeFrom(harvestAnchor, crop.daysToMaturity);
  const harvestEnd = crop.harvestWindow
    ? rangeFrom(firstHarvest, crop.harvestWindow)
    : undefined;

  return { germination, transplant, firstHarvest, harvestEnd };
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDateRange(r: DateRange): string {
  return `${fmtDate(r.earliest)} – ${fmtDate(r.latest)}`;
}
