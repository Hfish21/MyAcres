# ADR-0009: Space + Planting model

- **Status:** Accepted
- **Date:** 2026-06-07
- **Deciders:** Hayden

## Context

The Crop library ([ADR-0008](0008-homestead-file-schema.md)) models *what* the owner grows. The
two features he wants next — a **scheduling/lifecycle** tracker ("it's June, start the onion
sets," then track it through its life) and a **layout** tool ("where / how much can I grow") —
both need the missing piece that connects a crop to reality: an *instance* of a crop, growing
somewhere, on a date. We design that here so the data model can inform the UI.

## Decision

Add two entities to the garden module: **Space** (a generalized growing area) and **Planting**
(a crop growing in a space on a date). Both features become *views* of the same plantings.

### Space — a growing area
A bed, row, container, box, or patch of ground. Fields: `name`, `type`
(bed/row/container/ground/other), `shape`, optional `capacityOverride`, optional `sun`, `notes`.

- **Geometry is a polygon in feet** (`shape: { points: [{x, y}] }`); a rectangle is four points.
  The v1 UI is **rectangle-first** (enter length × width in feet → a rectangle polygon), but the
  data is polygon-shaped so the future freeform draw-your-garden tool needs **no migration**.
- **Unit is feet / square feet** (the planning unit). Crop spacing stays in inches the way seed
  packets express it; the capacity math converts.

### Planting — a crop growing in a space
Fields: `cropId` (req), `spaceId` (req), `quantity`, `startDate`, `status`, `events[]`, `notes`.

- **One planting = one crop, in one space, one start date** (a batch). 20 tomatoes across two
  beds is two plantings.
- **Referential integrity, no orphans.** A planting always points at a real crop and a real
  space. Deleting a crop or a space **cascades** to its plantings, with a confirmation that names
  the count ("this removes 3 plantings"). Plantings are never left floating.
- **Lifecycle** `status`: planned → started → transplanted → growing → harvesting → done /
  failed. `events[]` are **checkpoints** (`{ stage, date, note? }`) — the owner logs how each
  stage actually went ("transplanted on the 15th — went well, lost 2 to cutworms"). The status
  gives structure; the events are the seed of journaling.

### Derived, never stored
- `area(space)` = polygon area (shoelace), square feet.
- `capacity(crop, space)` = `capacityOverride ?? floor(area ÷ areaPerPlant)`, where
  `areaPerPlant = spacingInRow × (spacingBetweenRows ?? spacingInRow) ÷ 144` sq ft.
- `fits` = `quantity ≤ capacity`. Over capacity **warns but does not block** (tool-not-oracle,
  [ADR-0004](0004-tool-not-oracle.md)) — the gardener knows their beds better than the math.
- **Projected schedule:** germination / transplant / first-harvest / harvest-end **date ranges**,
  computed from `startDate` + the crop's day-ranges (harvest counts from transplant for transplant
  crops, from sow for direct-sown — per the crop's `plantingMethod`).

### Three layers, kept separate (reconciling the "two schedules")
1. **Schedule (projected)** — predictions of the growth process (germinate/harvest windows).
   *Derived automatically* from plantings + crop timing. Read-only.
2. **Checkpoints (actual)** — what really happened, logged on a planting's `events[]`.
3. **Tasks (to-do)** — actionable chores ("weed," "fertilize"), plus "do this now" prompts pulled
   from the schedule. Its **own future system** — *deferred* (see [ADR-0005](0005-core-module-architecture.md):
   tasks are cross-cutting core). The Schedule *predicts*, Checkpoints *record*, Tasks *act*.

### Storage
Spaces and plantings live under `modules.garden.data` alongside `crops`
(`{ crops, spaces, plantings }`). They're added as arrays that **default to `[]`**, so existing
crop-only files/autosaves still load with no migration; `garden.moduleVersion` bumps to `1.1.0`
(an additive, backward-compatible change, per the two-level versioning of ADR-0008).

## Consequences
- Both requested features now rest on one keystone (the Planting); the layout GUI and the
  timeline are different lenses on the same data.
- The polygon geometry future-proofs the visual garden map without a migration.
- Cascade-delete keeps the data honest (no dangling plantings) at the cost of a confirmation step.
- The schedule/checkpoints/tasks split tells us exactly how the (deferred) Tasks system will be
  modeled: it consumes the projected schedule and adds standalone/recurring chores.

## Deferred (intentionally, near-term where noted)
- **Time-aware / succession capacity** — "what's in this bed in July vs October," reusing a space
  across the season. A **near follow-up**; the schema already supports it (plantings carry dates),
  so it's a later compute/view layer, **not a migration**.
- The **visual layout GUI** (drag/draw the garden map, irregular polygons) and the **full
  timeline/Gantt** view — later view-phases on this data.
- The **Tasks** system; actual-date-driven refinement of projections; journaling.

## Alternatives considered
- **A fixed `length`/`width` on Space** instead of a polygon — simpler now, but forces a migration
  when freeform shapes arrive. Rejected; polygon-now costs little.
- **Blocking over-capacity / blocking deletion of referenced crops** — rejected: blocking
  contradicts tool-not-oracle, and the owner preferred cascade-with-confirmation over orphan-
  prevention-by-blocking.
- **Modeling Tasks now** — rejected/deferred: the schedule must be reconciled first (done here),
  and tasks are a cross-cutting core concern best built once, later.
