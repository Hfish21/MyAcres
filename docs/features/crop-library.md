# Feature: Crop Library

- **Module:** garden · **Status:** Shipped · **Route:** `/crops`
- **Related:** [ADR-0004](../decisions/0004-tool-not-oracle.md) (tool, not oracle),
  [ADR-0008](../decisions/0008-homestead-file-schema.md)

## Summary

The user's own editable library of **crops** — reusable profiles of the produce types they grow
(e.g. "Tomato — Solar Fire"). A crop holds the knowledge needed to plan with it: timing, spacing,
family, requirements, and expected yield. Plantings reference crops; the app never ships a crop
database — the user brings the numbers (tool-not-oracle).

## Data — the `Crop` entity (`src/lib/garden/schema.ts`)

- **Identity:** `name` (produce type, req), `variety?`, `family` (enum), `notes?`
- **Lifecycle/timing** (durations as `Range {min,max}`): `plantingMethod`
  (direct-sow | transplant), `daysToGerminate`, `daysToTransplant?` (transplant only),
  `daysToMaturity`, `harvestStyle` (single | continuous), `harvestWindow?`
- **Spacing:** `spacingInRow` (in), `spacingBetweenRows?` (in)
- **Requirements:** `light`, `season[]`, `tempRange?` (°F), `frostHardy`, `water`, `soilPh?`
- **Output:** `yieldPerPlant?`, `yieldUnit?`
- **Internal:** `id` (uuid), `createdAt`, `updatedAt`

## Behavior

- A ledger **table** (name + variety, family badge, method, days-to-maturity, spacing, light,
  seasons) with name/family **filters** and an empty state.
- **Add/Edit dialog** — the full field set grouped into sections; the `daysToTransplant` field
  appears only for transplant crops; validated with Zod on submit (inline errors).
- **Delete** — confirm dialog; cascades to any plantings of that crop (names the count).

## Components
`src/app/crops/page.tsx`, `src/components/crops/{crop-table,crop-dialog,crop-delete-dialog,crop-filters,range-input}.tsx`.

## Out of scope / future
Importing crop data (seed-catalog/UF-IFAS packs), multiple varieties per crop, photos. Family is
a fixed enum for now (user-editable families deferred).
