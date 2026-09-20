# Feature: Plantings & the Projected Schedule

- **Module:** garden · **Status:** Shipped · **Route:** `/plantings`
- **Related:** [ADR-0009](../decisions/0009-space-planting-model.md),
  [ADR-0004](../decisions/0004-tool-not-oracle.md)

## Summary

A **Planting** is the keystone: a crop growing in a space, from a start date — "Tomatoes in North
Bed, started March 1." It's the instance that connects the *what* (crop) to *where* (space) and
*when* (date), and everything visual is derived from it.

## Data — the `Planting` entity (`src/lib/garden/schema.ts`)

`cropId` (req), `spaceId` (req), `quantity`, `startDate`, `status` (planned → started →
transplanted → growing → harvesting → done/failed), `events[]` (lifecycle checkpoints:
`{stage, date, note?}`), `notes?`, timestamps. One planting = one crop, one space, one date.

## Derived (never stored)

- **Projected schedule** (`schedule.ts` `projectedDates`) — germination / transplant / first-
  harvest / harvest-end **date ranges**, from `startDate` + the crop's timing (harvest counts from
  transplant for transplant crops, from sow otherwise).
- **Capacity / fits** (`geometry.ts`) — `quantity` vs `floor(area ÷ spacing)`.
- **Trellis fit** — if the crop's `needsTrellis` is true, whether the assigned space's `trellis`
  is true. Purely a derived indicator (never stored, never blocks).

## Behavior

- A ledger **table** (crop, space, start, status badge, projected harvest window, qty/capacity)
  with crop/space search + status filter. When a crop `needsTrellis`, the space cell carries a
  small ✅ (olive check — "space has one") or ⚠️ (ochre alert — "space has none") indicator.
- **Add/Edit dialog** — pick crop + space + date + quantity; the **Fit** box shows the **capacity**
  live ("8 of ~5 — over capacity") and, when the crop `needsTrellis`, a trellis line
  ("Needs trellis — space has one" ✅ / "Needs trellis — space has none" ⚠️) in the same visual
  language; a separate box shows the **projected schedule**. Over-capacity and a missing trellis
  both **warn but never block** (tool-not-oracle). Status + checkpoint notes editable.
- **Delete** — confirm. Deleting a referenced crop or space cascades to its plantings.

## The "schedule" — three layers (reconciled in ADR-0009)
1. **Projected schedule** (this feature) — derived predictions.
2. **Checkpoints** — actuals logged on a planting's `events[]`.
3. **Tasks** — actionable to-dos. *Deferred*; will consume the schedule later.

## Components
`src/app/plantings/page.tsx`, `src/components/plantings/{planting-table,planting-dialog,planting-delete-dialog,planting-filters}.tsx`.

## Out of scope / future
The Tasks system; refining projections from logged actuals; richer journaling on checkpoints.
