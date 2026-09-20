# Feature: The Plan View

- **Module:** garden · **Status:** Shipped · **Route:** `/` (the app's home)
- **Related:** [ADR-0007 §5.7](../design/paper-desktop.md) (timeline treatment)

## Summary

The home dashboard — a **visual, read-only** overview of the garden over time, derived entirely
from plantings. It answers "what's planted, when does it all happen, and where are the gaps?" It
visualizes; it does not prescribe.

## What it shows (`src/components/plan/`)

1. **Garden Timeline** (`garden-timeline.tsx`) — an almanac-style Gantt: each planting a row,
   months across the top, drawn as **establish → growing → harvest** stage bars (olive → amber,
   pattern-filled), with a **TODAY** line and legend. Faint **season bands** wash the background
   (spring/summer/fall/winter) for orientation. A **controls bar** filters and organizes it:
   **group by crop** (default ON — plantings collapse under a crop-name header; click a header to
   *solo* just that crop), **sort** (soonest-first / crop name), and multi-select **season** and
   **family** filters (families shown only when present). A "clear filters (X/Y)" readout shows how
   many plantings match. Degrades to a filtered, sorted per-planting agenda list on mobile.
2. **Up Next** (`up-next.tsx`) — derived upcoming milestones (Sow / Transplant / Harvest begins)
   across all plantings, soonest first, past-due flagged. Status-aware (skips reached stages).
3. **Harvest Coverage** (`harvest-coverage.tsx`) — a month strip tinted by how many plantings are
   in harvest each month; **pale months are supply gaps**. **Clicking a month** selects it: a list
   of what's in harvest that month (crop · variety · space) expands below, and a **rust marker
   column** is drawn on the Garden Timeline at that month (shared `selectedMonth` state, lifted to
   the page). Click again to clear.
4. **Food Production** (`food-production.tsx`) — projected **yield per month**, stacked by unit,
   spread across each planting's harvest window from `yieldPerPlant × quantity`. The "how much
   food" view; notes how many crops still lack yield data. Empty-states when no yields are entered.
5. **Harvest by Crop** (`crop-coverage-grid.tsx`) — a vegetable × month **matrix** (amber cell =
   in harvest), exposing per-crop gaps the aggregate hides. Month headers also drive `selectedMonth`.
6. **Space Utilization** (`space-utilization.tsx`) — **% of total growing area occupied** each
   month; low bars are open capacity to plant into.
7. **Summary stats** (`plan-summary.tsx`) — plantings, in-harvest-now, spaces, growing area.

## Derived helpers (`src/lib/garden/insights.ts`)
`lifecycleSegments`, `timelineWindow` + `positionPct`, `harvestCoverage`, `upcomingMilestones`,
`harvestingInMonth`, `cropCoverageGrid`, `yieldByMonth`, `spaceUtilization`, `seasonOfMonth`,
`monthKey` — all pure, built on `projectedDates`. Read-only: the Plan view never mutates the store.
Still a *visualizer* of entered data, not a predictor/advisor (ADR-0004).

## Component
`src/app/(app)/plan/page.tsx` composes the pieces in Paper Desktop `Window`s and owns the shared
`selectedMonth` crossfilter between Harvest Coverage, the Timeline, and Harvest by Crop.

## Out of scope / future
Click a bar to open the planting, drag to reschedule; a real Tasks system fed by the milestones;
saved filter presets; and supply-*target* math (yield vs. a household demand goal).
