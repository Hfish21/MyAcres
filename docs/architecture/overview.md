# Architecture Overview

_Last updated: 2026-06-06 · Status: living document (pre-build)_

This describes the intended high-level architecture. Details get pinned down in ADRs and
feature specs as we build.

## Mental model: shell + modules

```
┌─────────────────────────────────────────────────────────────┐
│                          SHELL (core)                        │
│                                                              │
│   Storage        Tasks &         Journal       Dashboard     │
│  (.homestead)   Scheduling     (log + notes)  (today view)   │
│       │             ▲               ▲              ▲          │
│       │             │ generates     │ writes       │ pulls    │
│  Module Registry ───┼───────────────┼──────────────┘          │
│                     │               │                         │
└─────────────────────┼───────────────┼─────────────────────────┘
                      │               │
        ┌─────────────┴───────────────┴─────────────┐
        │            GARDEN module                   │
        │  crop library · beds · plantings ·         │
        │  harvest log · timeline · (its own views)  │
        └────────────────────────────────────────────┘
        (future: Livestock, Equipment, … — not built)
```

The shell knows nothing about gardens. It knows the **module contract**. Modules own their
data slice and their views; they lean on core services for the cross-cutting stuff.

## Core services

| Service | Responsibility | Notes |
|---|---|---|
| **Storage** | Load/save the portable `.homestead` file | Swappable adapter, file-first default ([ADR-0003](../decisions/0003-file-first-storage-no-database.md)) |
| **Tasks & scheduling** | Surface, complete, and track tasks | Cross-cutting. Modules *generate* tasks; core owns them ([ADR-0005](../decisions/0005-core-module-architecture.md)) |
| **Journal** | Free-text + structured log entries | Cross-cutting. Optional `source` backreference to a module |
| **Dashboard** | "What needs attention today" across modules | **Pull** model — core asks each module for its items |
| **Module registry** | Static list of installed modules | One module (Garden) for now |

## The module contract (intended)

A module is a self-contained folder exporting a single descriptor. Sketch (subject to an ADR
when we build it):

```ts
interface ModuleManifest {
  id: string;            // "garden" — namespace key in the .homestead file
  name: string;          // "Garden"
  icon: ReactNode;
  version: string;       // module schema version (semver)

  // DATA
  initState: () => ModuleState;                 // empty-state factory
  migrate: (state: unknown, from: string) => ModuleState;
  schema: ZodSchema;                            // validates its own slice

  // VIEWS — routes the shell mounts under /{id}/*
  routes: RouteDescriptor[];

  // DASHBOARD — pull model
  getDashboardItems: (state, ctx) => DashboardItem[];

  // TASKS — derive tasks from module state, fed into the core scheduler
  taskGenerators: TaskGenerator[];
}
```

**Decoupling rules:**

- Modules **never** import each other. Sharing goes through core.
- A module gets its own data slice + a few core services. It cannot reach into another
  module's slice.
- Tasks and journal entries are **core types** with an optional `source: { module, refId }`
  backreference.
- The dashboard is **pull, not push** — modules return items; they don't know the dashboard
  exists.

**Anti-goals for v1:** no plugin loader, no dynamic install, no per-module settings
framework, no inter-module event bus. Modules are statically imported into a registry array.
See [ADR-0002](../decisions/0002-personal-first-platform-mindful.md).

## The `.homestead` file (intended shape)

Single JSON file; core data at the root, modules namespaced under `modules`. Two-level
versioning so a module change never forces a core migration (and vice versa).

```jsonc
{
  "fileFormat": "homestead",
  "schemaVersion": "1.0.0",          // CORE/envelope version
  "meta": { "createdAt": "…", "updatedAt": "…", "appVersionLastWritten": "…" },
  "profile": { /* owner-set preferences */ },
  "core": {
    "tasks": [ /* Task[] — cross-module */ ],
    "journal": [ /* JournalEntry[] — cross-module */ ]
  },
  "modules": {
    "garden": { "moduleVersion": "1.0.0", "data": { /* … */ } }
  }
}
```

**Migration discipline (the thing that keeps modules easy to add):**

- Per-namespace, forward-only, sequential migrations (`vN → vN+1`, pure functions).
- **Preserve unknown modules untouched on save** — opening a file in a build that lacks a
  module must not drop that module's data.
- **Back up before migrating**; validate on load and fail loud rather than silently mutate.

The exact schema will be locked in its own ADR before the storage layer is built.

## Tech stack (intended)

- Next.js (static export) + TypeScript + Tailwind + shadcn/ui
- Zod for runtime validation of the file and each module slice
- File System Access API with download/upload fallback
- Static hosting (GitHub Pages), no backend

## Frontend structure (sketch, for when we scaffold)

```
src/
  core/
    storage/        # adapters + the .homestead schema
    tasks/          # scheduler service + types
    journal/        # journal service + types
    dashboard/      # aggregation
    registry.ts     # the static module list
  modules/
    garden/
      manifest.ts   # ModuleManifest
      data/         # schema, migrations, types
      views/        # routes/components
  shell/            # nav, layout, file open/save UI
  app/              # Next.js routes
```
