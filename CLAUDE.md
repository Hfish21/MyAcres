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
- **[docs/features/](docs/features/)** — per-feature specs: what each view does and its data.
- **[docs/decisions/](docs/decisions/)** — ADRs. **These are binding.** Don't contradict an
  accepted ADR without proposing a new ADR that supersedes it.

## Status

**The Garden module is built and working** — the full loop: define crops, draw/manage growing
spaces, record plantings, and visualize the plan over time. Storage, the shell, and five views
are all in place. Per-feature detail lives in [`docs/features/`](docs/features/).

### Views (routes)
- `/` — **Landing**: a chrome-free marketing front door (no app shell, no homestead store).
  Explains what MyAcres is, how the file workflow works, and the feature set; CTAs into `/plan`.
  Everything below lives under the `(app)` route group (shell + provider). ([ADR-0010](docs/decisions/0010-landing-page-and-route-groups.md))
- `/plan` — **Plan** (app home): a visual, derived dashboard — garden timeline (Gantt), "Up Next"
  milestones, a harvest-coverage strip, and summary stats. Read-only.
- `/layout` — **Layout**: an interactive SVG dot-grid canvas. Draw/arrange/copy growing spaces,
  see plantings as crop-colored density dots, and a **date scrubber** that fills/empties beds
  across the season.
- `/crops` — **Crops**: the crop library (CRUD) — produce-type profiles (timing, spacing, …).
- `/spaces` — **Spaces**: growing-area list (CRUD).
- `/plantings` — **Plantings**: a crop in a space on a date; shows the projected schedule +
  capacity/fits.

### Code map
- `src/lib/homestead/` — the `.homestead` file: `constants`, `envelope` (Zod + parse/migrate),
  `file-io` (File System Access + download fallback + IndexedDB autosave), `store`
  (`HomesteadStore`, CRUD + cascade-delete, `getStore()` singleton).
- `src/lib/garden/` — `schema` (Zod: Crop/Space/Planting, the single source of truth), `labels`,
  `geometry` (area, capacity, polygon ops, packing), `schedule` (`projectedDates`), `insights`
  (timeline window, lifecycle segments, harvest coverage, upcoming milestones), `colors`.
- `src/components/homestead/` — provider, app-shell, top-bar (nav), file-controls.
- `src/components/{ui,crops,spaces,plantings,plan,layout}/` — the `Window` primitive + reskinned
  shadcn, and per-feature components.

## Commands

```bash
pnpm install        # install deps
pnpm dev            # dev server at http://localhost:3000
pnpm build          # static export to out/  (output: "export")
pnpm preview        # serve the built out/ locally (npx serve out)
pnpm lint           # eslint
pnpm icons          # regenerate PWA icons from public/logo.svg (sharp)
```

Deploy: pushing/merging to `main` runs `.github/workflows/deploy-pages.yml` (build → GitHub
Pages). The `myacres.app` custom domain (CNAME committed) is **not connected yet** — go-live
is deferred until there's something real.

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

## Tech stack

Scaffolded in Phase 0 (mirrors BudgetOnTarget):

- **Frontend:** Next.js 16 (App Router, static export) + React 19 + TypeScript + Tailwind v4
  + shadcn/ui (`base-nova`, Base UI — not Radix). pnpm. App lives at the repo root.
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
