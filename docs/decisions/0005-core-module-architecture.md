# ADR-0005: Shell + module architecture

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden

## Context

MyAcres is meant to grow over time with modules for different parts of the homestead
(garden first; later possibly livestock, equipment, etc.). We need an organization that makes
adding a feature/module straightforward without entangling unrelated parts.

A key observation while decomposing the garden's needs: several of them aren't actually
garden-specific. **Task tracking/scheduling** and **journaling** recur across every domain —
livestock needs tasks, equipment needs maintenance logs, all of it benefits from a journal.
They are calendar-and-log shaped regardless of domain.

## Decision

We will organize the app as a **shell (core) + pluggable modules**.

- **Core owns cross-cutting services:** storage, tasks & scheduling, journal, dashboard, and
  the module registry.
- **Modules own a domain:** their own data slice and their own views. The first module is
  **Garden**.
- **Tasks and journal entries are core types.** Modules *generate* tasks (e.g. "transplant
  tomatoes by 3/15") via task generators, but the core scheduler surfaces, completes, and
  tracks them. Entries may carry an optional `source: { module, refId }` backreference.
- **The dashboard is a pull model:** core asks each registered module for its
  "what needs attention" items; modules don't know the dashboard exists.

**Decoupling rules:**

- Modules never import each other; any sharing goes through core.
- A module is handed its own data slice plus a few core services; it cannot reach into
  another module's slice.
- A module declares itself to the shell via a single manifest (id/namespace, version, data
  schema + migrations, routes, dashboard contributions, task generators).

Per [ADR-0002](0002-personal-first-platform-mindful.md), we implement this contract for the
**one** module we have and resist generalizing for hypothetical modules.

## Consequences

- Cross-cutting features (scheduler, journal, dashboard) are built once and reused by every
  module — the main payoff of this structure.
- Clear ownership boundaries make features easier to add and reason about.
- The `.homestead` file namespaces module data under `modules.<id>`, which drives the
  two-level (core + per-module) versioning and migration approach (see architecture
  overview). This shared file is the main coupling risk and is managed via migration
  discipline.
- The module contract sketched now will likely change when a real second module exists; we
  accept that and treat v1's contract as provisional.

## Alternatives considered

- **Per-module everything (tasks/journal inside each module)** — rejected: duplicates the
  scheduler and journal across modules and fragments the "today across the homestead" view.
- **One monolithic garden app, no shell** — rejected: would have to be substantially rebuilt
  to add a second domain; contradicts the platform-mindful goal ([ADR-0002](0002-personal-first-platform-mindful.md)).
