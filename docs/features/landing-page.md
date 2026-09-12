# Feature: Landing page

- **Module:** core
- **Status:** Shipped
- **Related ADRs:** [ADR-0010](../decisions/0010-landing-page-and-route-groups.md), [ADR-0007](../decisions/0007-design-language-paper-desktop.md), [ADR-0002](../decisions/0002-personal-first-platform-mindful.md)
- **Last updated:** 2026-09-11

## Summary

A chrome-free marketing page at `/` — the front door for people arriving at myacres.app. It
explains what MyAcres is, who it's for, how the file-based workflow works, and what the current
Garden module does, then sends visitors into the app at `/plan`.

## User stories

- As a first-time visitor, I want to understand what MyAcres is and whether it's for me before I
  click into an app I've never seen.
- As someone who's heard "it's like BudgetOnTarget for the garden," I want a page that shows the
  actual features and the how-it-works flow.
- As the owner, I want a place to describe the platform that grows as modules are added.

## Behavior

- `/` renders the landing with **no app shell** (no top bar, no file controls) and **without
  mounting the homestead store** — the app lives under the `(app)` route group (see ADR-0010).
- Sections, top to bottom: header (wordmark + theme toggle + "Open MyAcres" CTA), hero,
  "What it's for," "How it works" (four steps ending in *save your file*), "The Garden module"
  (the five views as feature cards), "How it's built" (the three principles), a closing CTA, and
  a footer.
- Every CTA and feature card links into the app; the primary CTAs go to `/plan`, each feature
  card deep-links to its view (`/plan`, `/layout`, `/crops`, `/spaces`, `/plantings`).
- Respects light/coffee-dark themes via the shared `ThemeToggle` and the no-flash init script.

## Data

None. The landing is a static server component — it reads and writes nothing in the `.homestead`
file and mounts no provider. No schema impact.

## UI / UX

- Paper Desktop language (ADR-0007): warm paper surfaces, borders not shadows, humanist sans body
  with mono as the chrome/label texture, `rust` as the single saturated accent. Feature cards
  reuse the `Window` title-bar motif (mono uppercase title on a flat tan strip) so the marketing
  page and the app read as one system.
- Mobile-first: single-column stacks that become 2–4 column grids at `sm`/`md`/`lg`; the header
  collapses the "Homestead OS" label on small screens.
- Content lives inline in `src/app/page.tsx` (feature/step/principle arrays) — no CMS, per
  ADR-0002. Update the copy when the view set changes materially.

## Out of scope

- Screenshots/animated demos of the app (could be added later).
- Any per-module marketing beyond the current Garden module.
- Analytics, sign-up, or newsletter capture — there are no accounts.
