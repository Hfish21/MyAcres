# Feature Specs

Detailed specifications for MyAcres features. Each spec describes what a feature does, how it
works, and how we'll know it's done — written/updated **before** the feature is built and
kept current as it evolves.

ADRs ([`../decisions/`](../decisions/)) capture *why* a decision was made; feature specs
capture *what* we're building and *how* it should behave.

## Conventions

- One spec per feature: `feature-name.md`. Copy [`feature-template.md`](feature-template.md)
  to start.
- Group by module where useful (e.g. `garden-plantings.md`, `core-tasks.md`).
- Link to the ADRs a feature depends on.

## Index

| Feature | Module | Route | Status |
|---------|--------|-------|--------|
| [Crop Library](crop-library.md) | garden | `/crops` | Shipped |
| [Spaces & Layout Editor](spaces-and-layout.md) | garden | `/spaces`, `/layout` | Shipped |
| [Plantings & Schedule](plantings-and-schedule.md) | garden | `/plantings` | Shipped |
| [Plan View](plan-view.md) | garden | `/` | Shipped |

_Deferred features (Tasks, journaling, succession/time-aware capacity) get specs when built._
