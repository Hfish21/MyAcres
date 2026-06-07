# ADR-0006: Static PWA tech stack

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden

## Context

We need a stack that delivers the BudgetOnTarget qualities the owner values: easy to add
features to, easy to deploy, testable locally, looks great out of the box, portable, and
runnable as a browser-only PWA with no required backend ([ADR-0003](0003-file-first-storage-no-database.md)).
The owner already knows and likes the BudgetOnTarget stack.

## Decision

We will build MyAcres as a **static Progressive Web App** using the BudgetOnTarget-style
stack:

- **Framework:** Next.js with static export
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Validation:** Zod (for the `.homestead` file and each module's data slice)
- **Storage:** File System Access API with download/upload fallback (file-first; see
  [ADR-0003](0003-file-first-storage-no-database.md))
- **Hosting:** static (e.g. GitHub Pages), like BudgetOnTarget — auto-deploy from `main`
- **No required backend.**

Design is **mobile-first** — the daily-use surface (log a harvest, complete a task) must work
one-handed, outdoors, in bright light. The planning/timeline views can lean desktop.

## Consequences

- Reuses the owner's existing expertise and the BudgetOnTarget look-and-feel; fast to ship.
- ~$0 hosting; infinite-scale static delivery if it ever goes public.
- Static export constrains us to client-side logic (a feature here, not a bug — it's the
  whole point). Any future server features must be optional and additive.
- Locks in TypeScript + Zod, giving us runtime-validated, well-typed file schemas — important
  for safe migrations of the single data file.

## Alternatives considered

- **A different framework (SvelteKit, plain Vite/React, etc.)** — viable, but reusing the
  known BudgetOnTarget stack maximizes velocity and design reuse with no compelling upside to
  switching.
- **Server-rendered app with a backend** — rejected by [ADR-0003](0003-file-first-storage-no-database.md);
  contradicts the offline-first, no-backend requirement.
