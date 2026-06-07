# ADR-0008: The `.homestead` file schema

- **Status:** Accepted
- **Date:** 2026-06-07
- **Deciders:** Hayden

## Context

[ADR-0003](0003-file-first-storage-no-database.md) chose a single portable file as the only
data store; [ADR-0005](0005-core-module-architecture.md) chose a shell + modules architecture
where module data is namespaced inside that file. The architecture overview promised the
concrete file schema would be "locked in its own ADR before the storage layer is built." We're
now building the first feature (the Crop library), which is the first thing to persist — so we
pin the schema and its versioning/migration discipline here.

The file will evolve a lot (new fields, new modules), and a user can carry it between app
versions and even hand-edit it. The schema therefore has to be (a) detectable and validatable,
(b) safely migratable, and (c) expandable without coupling unrelated parts together.

## Decision

### 1. A single JSON envelope

```jsonc
{
  "fileFormat": "homestead",          // magic marker — identifies a MyAcres file
  "schemaVersion": "1.0.0",           // CORE / envelope version (semver)
  "meta": {
    "createdAt": "…", "updatedAt": "…", "appVersionLastWritten": "0.1.0"
  },
  "modules": {
    "garden": {
      "moduleVersion": "1.0.0",       // PER-MODULE version (semver)
      "data": { "crops": [ /* Crop[] */ ] }
    }
    // future: other modules (e.g. "livestock"), and a core block for
    // cross-cutting tasks/journal, slot in here without touching this one.
  }
}
```

File extension: `.homestead`. The `fileFormat` literal is a marker so we can detect and reject
foreign JSON.

### 2. Two-level versioning

The core/envelope `schemaVersion` is **independent** of each module's
`modules.<id>.moduleVersion`. A garden schema change bumps `garden.moduleVersion` and does
**not** force a core migration, and vice versa. Both start at `1.0.0`.

### 3. Migration discipline

- **Forward-only, per-namespace, sequential** migrations — small pure functions `vN → vN+1`,
  one path for the envelope and one per module. v1 ships only the **identity** migration, but
  the migration step is structured (a switch on version) so adding `1.0.0 → 1.1.0` later is a
  one-liner. We don't write speculative migration code now ([ADR-0002](0002-personal-first-platform-mindful.md)).
- **Preserve unknown modules untouched on save.** Opening a file in a build that doesn't know
  a module (or a future core block) must never drop that data. Mechanism: Zod `.passthrough()`
  on `modules` (and the root), plus the store capturing unknown namespaces on load and
  re-emitting them on serialize.
- **Validate on load and fail loud.** Files are parsed through Zod before being ingested. An
  invalid file is **rejected with a clear error and the live in-memory data is left
  untouched** — we never silently mutate or partially load. A file whose major
  `schemaVersion` is newer than this build is refused with a "written by a newer MyAcres"
  message.
- **Back up before migrating.** Once real migrations exist, the pre-migration JSON is stashed
  (e.g. an IndexedDB backup key) before overwriting. v1 documents this discipline; with only
  an identity migration there is nothing to back up yet.

### 4. Validation & IDs

- Zod schemas validate the envelope and each module's data slice. TypeScript types are derived
  from the Zod schemas (`z.infer`) so types and validation can't drift.
- Entity IDs are **UUID strings** (`crypto.randomUUID()`), not auto-increment integers.

## Consequences

- The portable, user-owned file from ADR-0003 is preserved, now with a validated, versioned
  shape that survives round-tripping and hand-editing.
- We own migration of one evolving file — mitigated by the discipline above (two-level
  versioning, preserve-unknown, fail-loud, back-up-before-migrate).
- Adding a module later = a new namespace under `modules` with its own version; no change to
  the core schema or existing modules. Core cross-cutting data (tasks/journal) will slot in as
  a sibling block when those features are built.
- The v1 contract is provisional and expected to grow (echoes ADR-0005); the versioning is
  what makes that safe.
- UUID ids cost a little readability vs. integers but are robust as entities begin to
  cross-reference (plantings → crops → beds) and if files are ever merged.

## Alternatives considered

- **A flat, single-version file** (no module namespacing, one version number) — rejected:
  couples every module's evolution to one global version and to core migrations.
- **Separate files per module** (`.garden`, `.livestock`) — rejected: breaks the "one portable
  file" decision ([ADR-0003](0003-file-first-storage-no-database.md)) and the single-backup
  simplicity.
- **No envelope / marker, just the raw data** — rejected: can't reliably detect or validate a
  MyAcres file vs. arbitrary JSON, and leaves no place for versioning/meta.
- **Auto-increment integer IDs** (BudgetOnTarget's approach) — rejected for MyAcres: UUIDs avoid
  max-id collision logic and are safer under cross-references and any future merge.
