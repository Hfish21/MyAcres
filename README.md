# MyAcres

A portable, offline-first **homestead management** app. A modular tool for running the
homestead — starting with the **garden** — that you can grow over time, one feature at a
time.

> Status: **Phase 0 — scaffold + design system.** The app is scaffolded as a static PWA with
> the "Paper Desktop" design language and a showcase screen. Storage, the core shell, and the
> Garden module come next. Run `pnpm dev` to see it.

## What it is

MyAcres is a personal-use **Progressive Web App** in the spirit of
[BudgetOnTarget](https://budgetontarget.com): you open a web page, use it on your own
machine, and your data lives in a portable file you own — no database, no account, no
install required.

It's organized as a **shell + modules**:

- **The shell (core)** provides storage, tasks & scheduling, journaling, and a dashboard —
  the cross-cutting things every part of the homestead needs.
- **Modules** plug domain features into that shell. The first is **Garden**: crop library,
  beds & layout, plantings, harvest logging, and a timeline of what's growing and
  harvesting when.

The app is a **tool, not an oracle** — it records and visualizes what *you* tell it. It
doesn't decide what or when to plant; you bring that knowledge.

## Goal

Help the household plan and track food production toward feeding the family year-round —
the same kind of strategic visibility BudgetOnTarget gives our finances, applied to the
garden.

## Documentation

All project context lives in [`docs/`](docs/):

- **[Vision & brief](docs/brief.md)** — what we're building and why
- **[Architecture overview](docs/architecture/overview.md)** — the shell + module design
- **[Design language](docs/design/paper-desktop.md)** — "Paper Desktop": the look & feel
- **[Decision records (ADRs)](docs/decisions/)** — *why* things are the way they are
- **[Feature specs](docs/features/)** — detailed specs as features get built

## Tech

Static PWA: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui, file-first storage
(coming in Phase 1). No required backend. See
[ADR-0006](docs/decisions/0006-tech-stack-pwa.md) and
[ADR-0003](docs/decisions/0003-file-first-storage-no-database.md).

## Development

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # static export → out/
```

## Future

Built personal-first, but kept clean enough to grow into an open-source tool or SaaS later.
See [ADR-0002](docs/decisions/0002-personal-first-platform-mindful.md).
