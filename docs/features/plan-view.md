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
   pattern-filled), with a **TODAY** line and legend. Degrades to a per-planting agenda list on
   mobile.
2. **Up Next** (`up-next.tsx`) — derived upcoming milestones (Sow / Transplant / Harvest begins)
   across all plantings, soonest first, past-due flagged. Status-aware (skips reached stages).
3. **Harvest Coverage** (`harvest-coverage.tsx`) — a month strip tinted by how many plantings are
   in harvest each month; **pale months are supply gaps** (the feed-the-family-year-round view).
4. **Summary stats** (`plan-summary.tsx`) — plantings, in-harvest-now, spaces, growing area.

## Derived helpers (`src/lib/garden/insights.ts`)
`lifecycleSegments`, `timelineWindow` + `positionPct`, `harvestCoverage`, `upcomingMilestones` —
all pure, built on `projectedDates`. Read-only: the Plan view never mutates the store.

## Component
`src/app/page.tsx` composes the four pieces in Paper Desktop `Window`s.

## Out of scope / future
Interactivity (click a bar to open the planting, drag to reschedule), a real Tasks system fed by
the milestones, and yield-forecast/supply-target math (today it's a timeline, not a predictor).
