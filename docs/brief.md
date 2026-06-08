# MyAcres — Vision & Brief

_Last updated: 2026-06-08 · Status: living document (Garden module built)_

## One-liner

A portable, offline-first PWA for running the homestead — a modular tool you grow over time,
starting with the garden — that records and visualizes food production to help feed the
family year-round.

## Why

We built [BudgetOnTarget](https://budgetontarget.com) and loved the paradigm: a PWA that's
easy to add features to, easy to deploy, testable locally, looks great, is portable, and
stores its data as a file the user owns. MyAcres applies that same paradigm to the
homestead.

The strategic goal mirrors what BudgetOnTarget does for our finances: give us the visibility
and record-keeping to be **strategic about growing food** — nailing timing and planning the
harvest so we can move toward feeding the family year-round.

## What it is

A **homestead platform**: a shell that hosts pluggable **modules**. The first module is the
**Garden**. Future candidates (not committed): livestock, equipment/maintenance, and more.

### The shell (core)

Cross-cutting services every part of the homestead needs:

- **Storage** — a single portable `.homestead` file; swappable adapter, file-first default.
- **Tasks & scheduling** — recurring and one-off tasks with due dates and completion.
  Modules *generate* tasks; the core surfaces, completes, and tracks them.
- **Journal** — free-text plus a few structured fields (date, weather, notes). Inspired by
  the garden journals my wife's family kept ("planted tomatoes early this year, better
  yield").
- **Dashboard** — "what's happening / what needs attention" across modules.
- **Module registry** — how modules declare themselves to the shell.

### The Garden module (first tenant)

- **Crop library** — the user's own, editable list of crops with their timing (days to
  germinate, days to maturity / harvest window, spacing, etc.). The user owns these numbers.
- **Beds & layout** — named beds with dimensions and a coarse grid; spacing/orientation.
- **Plantings** — "crop X in bed Y on date Z" → derives a schedule from the user's own crop
  numbers (germinate, transplant, harvest window).
- **Tasks** — auto-generated from plantings, flowing into the core scheduler.
- **Harvest log** — record what was actually picked and when.
- **Timeline / Gantt** — a calendar view of what's growing and harvesting when
  ("tomatoes: in-ground March, harvesting Sept–Jan").
- **Journal** — the family garden-journal tradition, built in.

## Guiding principles

1. **Tool, not oracle.** MyAcres organizes and visualizes what you tell it. It does not
   decide what or when to plant — you bring that knowledge (e.g. from UF/IFAS guides). This
   removes any bundled-data liability and keeps v1 focused. ([ADR-0004](decisions/0004-tool-not-oracle.md))
2. **No database; portable file.** Your data is a file you own and can back up or hand off.
   ([ADR-0003](decisions/0003-file-first-storage-no-database.md))
3. **Offline-first, zero required dependencies.** Open a URL, use it on your machine. APIs,
   sensors, and sync are optional future add-ons.
4. **Personal-first, platform-mindful.** Built for us, cheaply — but kept clean enough to
   become open-source or SaaS later. ([ADR-0002](decisions/0002-personal-first-platform-mindful.md))

## Scope — status

**Built (the Garden module works):** the shell + portable `.homestead` storage; the **Crop
library**, **Spaces** (drawable on a visual layout canvas), and **Plantings** (with projected
schedules + capacity/fits); and the **Plan** view (garden timeline, up-next milestones, harvest
coverage). See [`features/`](features/).

**Deferred:** a real **Tasks** system and **journaling**; **time-aware/succession** capacity
("what's in a bed *when*"); yield *prediction* / forecasting math (we show a timeline, not a
predictive model); zone-aware planting intelligence; weather/sensor integration; multi-user /
sync / cloud; the module *registry* abstraction and other modules (livestock, equipment); dark
mode; and connecting `myacres.app`.

## Success criteria

- **The real test:** we use MyAcres to plan an actual growing season and log harvests against
  it for one full season. If it doesn't change real planting/record-keeping decisions, it
  failed.
- **The seam test:** a hypothetical second module could be added without touching Garden code
  or the core scheduler internals.

## Name & domain

**MyAcres.** `myacres.app` is available (~$20/yr) and is the intended home. Warm, easy to
say/spell, and scales past the garden to the whole property. `myacres.com` is taken;
`myacres.farm` / `getmyacres.com` are fallbacks if this ever goes public.

## Open questions

Tracked as they arise; resolved ones become ADRs. Current:

- Exact `.homestead` file schema shape and module-data namespacing (will be an ADR before the
  storage layer is built).
- Crop reference: store a denormalized snapshot of crop facts on each planting (recommended,
  for portability) vs. reference-by-id.
- App name vs. module naming as more modules appear.
