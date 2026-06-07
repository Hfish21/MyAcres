# ADR-0007: Design language — "Paper Desktop"

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden
- **Full specification:** [`docs/design/paper-desktop.md`](../design/paper-desktop.md)

## Context

Before building any UI we needed a defined visual identity. The owner explicitly wanted MyAcres
to **not** look like BudgetOnTarget (its clean fintech-SaaS look — bright white, soft shadows,
friendly blue) and to have its own distinct personality fitting a pragmatic homestead tool.

A first exploration ("Almanac Terminal") aimed at a command-line / green-screen terminal
aesthetic. The owner reacted that it went "too hard in the paint" — he liked the monospace
*type* flavor and the flat/square/paper feeling, but wanted something softer and friendlier:
the **retro graphical-desktop** look of PostHog's website (flat application "windows," squared,
warm paper colors, comfortable contrast), explicitly **not** a high-contrast terminal and
**not** the glossy/bevelled Windows-XP "Luna"/Aero style. The design was revised accordingly
and approved.

## Decision

We adopt **"Paper Desktop"** as the binding design language for MyAcres. The full spec is in
`docs/design/paper-desktop.md`; the load-bearing decisions:

- **Centerpiece motif — flat "windows."** Every meaningful section is a squared panel with a
  flat title bar (no gloss, no shadow). This maps 1:1 onto the shell + module architecture
  ([ADR-0005](0005-core-module-architecture.md)): the cream canvas is "the desktop," each
  module/section is a window. Adding a future module needs no new design.
- **Warm paper palette.** Cream canvas (`#F2ECDD`), near-white window bodies (`#FBF7EE`), warm
  charcoal text (`#2A2620`, not pure black), thin warm-neutral borders (`#C9BDA2`). Six earthy
  semantic accents (rust=primary, olive=growing, amber=harvest, ochre=warning, barn=danger,
  faded-blue=info/today) — reused across all future modules with zero new colors.
- **Typography rule — the app reads in a humanist sans; monospace is the data-and-chrome
  texture.** Default voice is **IBM Plex Sans**; **IBM Plex Mono** is reserved for window title
  bars, numbers/dates (tabular, ledger-aligned), data tables/timeline, and code-like chips.
  This keeps the "software" feel without the terminal read.
- **Flat-and-square contract.** Thin 1px borders, 6px corner radius, **no shadows / gradients /
  gloss**; elevation is communicated by border + surface tone only. Hierarchy comes from font
  weight and the window title bar, not heavy rules.
- **Comfortable, not severe, contrast** — softened from the first draft, but all body/label
  text still meets **WCAG AA**, gauged for outdoor sunlight legibility. Mobile-first; ≥44px tap
  targets; status never encoded by color alone.
- **Restraint on flourishes** — the pixel/retro display font and the brutalist "slam" button
  are **cut**; ASCII glyphs are used sparingly (Lucide line icons are the default).
- **Dark mode is deferred** to a later pass (v1.1).

This decision **confirms ADR-0006** (the static-PWA stack): **shadcn/ui is retained and
reskinned** to Paper Desktop (it is an *easier* fit for this softer look than the first draft).
One bespoke primitive — a `Window` wrapper component (title bar + body over a shadcn `Card`) —
is the key reusable building block. ADR-0006 is unchanged.

## Consequences

- We have a binding visual language and a starter token set ready for the Frontend agent
  (palette, fonts, radius/border rules in the spec's §8).
- The `Window` component is the foundational UI primitive; it must be built first and every
  module composes it. The two bespoke domain views (timeline/Gantt, bed-layout planner) are
  built on top of shadcn primitives.
- The design and the code architecture now tell the same story ("desktop + windows" =
  "shell + modules"), which lowers the cost of adding modules later.
- A few items are intentionally deferred and will get their own follow-ups when built: dark
  mode, and tuning the exact soft-callout tint values (done in code with the Frontend agent).

## Alternatives considered

- **"Almanac Terminal" (command-line aesthetic)** — the first draft. Rejected by the owner as
  too severe / "too hard in the paint." Its good parts (warm paper, flat/square, monospace as
  flavor, tabular ledger numbers) were carried forward.
- **Reusing the BudgetOnTarget look** — rejected: the owner explicitly wanted a distinct
  identity for this product.
- **Replacing shadcn/ui with a bespoke component layer** — rejected: reskinning shadcn is less
  work, keeps accessibility/keyboard-nav for free, and matches the existing stack (ADR-0006).
- **Glossy Windows-XP / Frutiger-Aero styling** — rejected: we want XP-era squareness and
  windowed structure, but flat and in paper colors, never gloss/bevel/gradient.
