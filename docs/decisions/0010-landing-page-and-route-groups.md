# ADR-0010: Landing page at `/`, app under an `(app)` route group

- **Status:** Accepted
- **Date:** 2026-09-11
- **Deciders:** Hayden

## Context

MyAcres is live at [myacres.app](https://myacres.app) ([deploy setup done separately]). Until
now the root route `/` rendered the **Plan** view — the app dropped you straight into the
garden dashboard. Every route was wrapped by the root layout's `HomesteadProvider` + `AppShell`
(top bar, file controls, autoloaded homestead store), so there was no chrome-free surface for a
first-time visitor.

BudgetOnTarget — the paradigm MyAcres follows ([ADR-0002](0002-personal-first-platform-mindful.md)) —
uses its `/` route as a **marketing landing page** that explains the app and links into it (the
app itself lives at `/dashboard`, `/transactions`, …). We wanted the same: a page that says what
MyAcres is, who it's for, how the file-based workflow works, and what the Garden module does —
without the app top bar, and without mounting the homestead store.

## Decision

We will make `/` a **standalone landing page** and move the application views into a Next.js
**`(app)` route group**:

- `src/app/page.tsx` is the landing — a server component, no `HomesteadProvider`, no `AppShell`.
  It follows the Paper Desktop design language ([ADR-0007](0007-design-language-paper-desktop.md)):
  flat windows on warm paper, mono as chrome texture, `rust` as the single accent. Feature cards
  reuse the `Window` title-bar motif.
- The provider + shell move out of the **root** layout into **`src/app/(app)/layout.tsx`**, so
  they wrap only the app routes.
- **Plan moves from `/` to `/plan`.** The other views keep their URLs (route groups don't affect
  the path): `/layout`, `/crops`, `/spaces`, `/plantings`.
- The root layout keeps the origin-wide concerns: fonts, the no-flash theme-init script,
  `ServiceWorkerRegister`, and metadata.
- The top-bar nav points Plan at `/plan`; the wordmark links to `/plan`. Active-state matching is
  boundary-aware (`pathname === href || startsWith(href + "/")`) so `/plantings` no longer lights
  up the `/plan` tab.

## Consequences

- There is now a clear front door for people arriving at myacres.app, and a natural place to
  describe modules/features as the platform grows.
- The landing renders with zero app JS state — it never touches the `.homestead` store, so it's
  fast and can't error on file/storage concerns.
- The app's home URL changed to `/plan`. Any bookmark to the bare domain now lands on marketing,
  not the dashboard — which is the intended behavior of a landing page; the app is one click away.
- The shell/provider boundary is now the route group, not the root layout. New **app** views must
  be created **inside `(app)/`** to inherit the shell; a new top-level route renders chrome-free.
- Landing copy describes the current feature set, so it needs a light touch-up when views change
  materially. Kept as plain content in one file (no CMS) per [ADR-0002](0002-personal-first-platform-mindful.md).

## Alternatives considered

- **Keep Plan at `/`, add a separate `/about` or `/welcome` landing.** Rejected: the domain root
  is the page visitors actually hit, so the explainer belongs there — a buried `/about` wouldn't
  do the job BudgetOnTarget's `/` does.
- **Gate the app behind a landing/wizard on `/` that reveals the dashboard after interaction.**
  Rejected: heavier, stateful, and against the "app autostarts an empty homestead, no welcome
  wizard" stance already baked into `AppShell`.
- **Conditionally hide the shell on `/` from within the root layout.** Rejected: route groups are
  the idiomatic App Router seam for "some routes have chrome, some don't," and keep the landing
  from mounting the provider at all.
