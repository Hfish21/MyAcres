# Architecture Overview

_Last updated: 2026-06-08 · Status: as built (Garden module working)_

How MyAcres is actually put together today, plus where the architecture is headed. Decisions
are recorded in [ADRs](../decisions/); per-feature behavior in [feature specs](../features/).

## Mental model: shell + modules

The guiding architecture ([ADR-0005](../decisions/0005-core-module-architecture.md)) is a
**shell (core)** that owns cross-cutting concerns, hosting **modules** that own a domain. Today
there is exactly one module — **Garden** — so the "module" is a lightweight **convention** (a
data namespace + a `lib/` slice + components), **not** a plugin registry. We build the
abstraction when a second module justifies it (rule-of-three, [ADR-0002](../decisions/0002-personal-first-platform-mindful.md)).

```
Shell (core)            Garden module
  storage (.homestead)    crops · spaces · plantings        ← data (under modules.garden)
  provider + dataVersion  schema · geometry · schedule ·    ← lib/garden
  app-shell + top-bar     insights · colors
  file controls           Plan · Layout · Crops · Spaces ·  ← views (routes)
                          Plantings
```

## What exists today

### Shell (`src/components/homestead/`, `src/lib/homestead/`)
- **Storage** — a single portable `.homestead` JSON file. `store.ts` (`HomesteadStore`) holds the
  data in memory with subscriber/dirty tracking and CRUD (incl. cascade-delete, no orphans);
  `file-io.ts` saves/opens via the File System Access API (download/`<input>` fallback) and
  autosaves to IndexedDB; `envelope.ts` validates/parses with Zod. `getStore()` is a singleton.
- **Provider** — `homestead-provider.tsx`: a React context exposing the store, `dirty`,
  `loading`, `fileLoaded`, a `dataVersion` counter (re-render signal), and `open/save/new`.
- **Chrome** — `app-shell.tsx` (load gate + error banner), `top-bar.tsx` (the **static nav**
  list — the future module strip), `file-controls.tsx` (New/Open/Save + Saved/Unsaved chip).

### Garden module (`src/lib/garden/`, `src/components/{crops,spaces,plantings,plan,layout}/`)
- `schema.ts` — Zod schemas for **Crop**, **Space**, **Planting** (+ the garden module slice);
  the single source of truth (TS types via `z.infer`).
- `geometry.ts` — `polygonArea`, `capacity`, polygon ops (`pointInPolygon`, `packPositions`,
  `translatePolygon`, …). `schedule.ts` — `projectedDates` (germination/transplant/harvest
  ranges). `insights.ts` — timeline window, lifecycle segments, harvest coverage, upcoming
  milestones, `plantingActiveOn`. `labels.ts`, `colors.ts` — display helpers.
- Five views (see [CLAUDE.md](../../CLAUDE.md) for the route map): **Plan** (visual dashboard),
  **Layout** (draw-your-garden canvas), **Crops**, **Spaces**, **Plantings**.

### Entities (the data model)
- **Crop** — a reusable profile of a produce type (timing as `{min,max}` ranges, spacing,
  family, requirements, yield). [ADR-0008]
- **Space** — a growing area: a polygon (feet) + type/sun/notes; capacity = area ÷ spacing.
- **Planting** — a crop in a space on a start date, with quantity, lifecycle `status`, and
  `events[]` checkpoints. [ADR-0009]
- **Derived, never stored:** `projectedDates`, `capacity`/fits, `lifecycleSegments` — these power
  the Plan timeline, the Layout scrubber, and the capacity warnings.

## The `.homestead` file (as built — [ADR-0008](../decisions/0008-homestead-file-schema.md))

A single JSON envelope; module data namespaced; two-level versioning.

```jsonc
{
  "fileFormat": "homestead",
  "schemaVersion": "1.0.0",            // core/envelope version
  "meta": { "createdAt": "…", "updatedAt": "…", "appVersionLastWritten": "0.1.0" },
  "modules": {
    "garden": {
      "moduleVersion": "1.1.0",        // bumped when adding spaces/plantings (additive)
      "data": { "crops": [ … ], "spaces": [ … ], "plantings": [ … ] }
    }
  }
}
```

- **Two-level versioning** — core `schemaVersion` is independent of each module's
  `moduleVersion`; additive changes default missing arrays to `[]` (backward-compatible).
- **Migration discipline** — Zod-validate on load and **fail loud** (never partially load);
  `.passthrough()` **preserves unknown modules**; forward-only migration is a structured stub
  (identity at v1). UUID string ids.
- A **core block** for cross-cutting `tasks`/`journal` is *reserved by the design* but **not yet
  present** — it slots in as a sibling of `modules` when those features are built.

## Tech stack (as built — [ADR-0006](../decisions/0006-tech-stack-pwa.md))
Next.js 16 (App Router, static export) + React 19 + TypeScript + Tailwind v4 + shadcn/ui
(`base-nova`/Base UI), Zod, pnpm. File System Access API + IndexedDB. Static, **no backend**.
Paper Desktop design language ([ADR-0007](../decisions/0007-design-language-paper-desktop.md)).

## Deliberately deferred (build when justified)
- The **module registry / manifest contract** — today modules are a convention, not a framework
  (ADR-0002). The static nav stands in for a registry.
- **Core Tasks & Journal services** and a cross-module **dashboard "pull" abstraction** — the
  Plan view currently derives its insights directly from garden data. Tasks/journal arrive as
  their own pass; the schedule/checkpoints/tasks split is reconciled in [ADR-0009](../decisions/0009-space-planting-model.md).
- **Time-aware/succession capacity**, dark mode, and the `myacres.app` go-live.
