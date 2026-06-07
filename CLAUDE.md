# CLAUDE.md — MyAcres

Guidance for Claude Code when working in this repository.

## What this is

MyAcres is a **portable, offline-first homestead management PWA**. It follows the
BudgetOnTarget paradigm: a browser-only Progressive Web App, served as a static site, with
data stored in a portable file the user owns — **no database, no required backend, no
install**. It is organized as a **shell (core) + pluggable modules**; the first module is
**Garden**.

Read these before doing substantive work — they hold the *why*:

- **[docs/brief.md](docs/brief.md)** — vision, scope, what's in/out for v1
- **[docs/architecture/overview.md](docs/architecture/overview.md)** — shell + module design
- **[docs/design/paper-desktop.md](docs/design/paper-desktop.md)** — the **binding design
  language** ("Paper Desktop"). All UI work follows this: flat windows on warm paper, sans-first
  with mono as data/chrome texture, the token set in §8, the `Window` component as the core
  primitive. ([ADR-0007](docs/decisions/0007-design-language-paper-desktop.md))
- **[docs/decisions/](docs/decisions/)** — ADRs. **These are binding.** Don't contradict an
  accepted ADR without proposing a new ADR that supersedes it.

## Status

**Pre-build.** This repo currently holds documentation only. There is no application code
yet. When we start building, this file should be updated with the real commands.

## Core principles (binding — see ADRs)

1. **Tool, not oracle.** The app records and visualizes what the user enters. It does not
   provide gardening intelligence (no bundled planting calendars, no "you should plant
   now"). The user brings the knowledge. ([ADR-0004](docs/decisions/0004-tool-not-oracle.md))
2. **No database.** Data lives in a single portable file (`.homestead`), via a swappable
   storage service with a file-first default. ([ADR-0003](docs/decisions/0003-file-first-storage-no-database.md))
3. **Offline-first, zero dependencies for the core experience.** A normal person opens a URL
   and uses it on their own machine. APIs/sensors/sync are optional future add-ons, never
   required. ([ADR-0003](docs/decisions/0003-file-first-storage-no-database.md))
4. **Personal-first, platform-mindful.** Build for the owner now, cheaply. Keep the
   core/module seam and storage layer clean so a future open-source/SaaS move is easy — but
   do **not** build speculative abstractions for modules that don't exist yet. Generalize at
   the rule-of-three. ([ADR-0002](docs/decisions/0002-personal-first-platform-mindful.md))
5. **Cross-cutting concerns live in core.** Tasks/scheduling and journaling belong to the
   shell, not to any one module. ([ADR-0005](docs/decisions/0005-core-module-architecture.md))

## Intended tech stack

Not yet scaffolded. Planned:

- **Frontend:** Next.js (static export) + TypeScript + Tailwind CSS + shadcn/ui
- **Storage:** file-first (`.homestead` JSON) via the File System Access API, with
  download/upload fallback. Swappable adapter pattern.
- **Data validation:** Zod schemas for the file and each module's data slice
- **Hosting:** static (e.g. GitHub Pages), like BudgetOnTarget
- **No backend** is required for core functionality.

## Working conventions

- **Document decisions as ADRs.** Any non-trivial architectural or product decision gets an
  ADR in `docs/decisions/` (copy `adr-template.md`, next number in sequence). This is how we
  preserve context across sessions. ADRs are append-only history — supersede, don't rewrite.
- **Document features as specs.** Before building a feature, write/update its spec in
  `docs/features/` (copy `feature-template.md`).
- **Git hygiene (mandatory):** work on feature branches, never commit straight to `main`.
  Clean, focused commits. Push often. Open a PR before merging. The owner runs a strict
  branching workflow on his projects.
- **The user's real data file is sacred.** `.homestead` files are git-ignored and must never
  be committed or destroyed. Treat them like the BudgetOnTarget database.
- **Don't over-engineer.** Match the lean, ship-it spirit of BudgetOnTarget.

## Commit attribution

End commit messages with:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```
