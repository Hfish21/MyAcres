# ADR-0004: The app is a tool, not an oracle

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden

## Context

An early framing of the garden module imagined it being *smart* about the owner's climate
(Florida) — bundling planting calendars, frost/heat windows, and a crop library so the app
could tell the user when to plant and warn when they're outside the recommended window.

That framing carries a heavy, recurring liability: the bundled reference data (planting
windows, days-to-maturity, yields) would have to be authoritative and curated, and bad data
would silently destroy the app's core value. It also would have required up-front research to
source and license region-specific data (e.g. UF/IFAS), blocking the build.

The owner's steer: the app's job is to be **the tool, not to provide intelligence on what
decisions to make.** He'll use authoritative guides (like UF/IFAS) himself and enter the
relevant numbers; the app should faithfully record and visualize what he tells it.

## Decision

MyAcres is a **tool, not an oracle.** It records, organizes, and visualizes what the user
enters. It does **not** ship gardening intelligence and does not advise what or when to
plant.

Concretely:

- The **crop library is the user's own**, editable data. The user sets the timing numbers
  (days to germinate, days to maturity / harvest window, spacing, etc.).
- **No bundled authoritative planting calendars, zone tables, or frost-date intelligence.**
- **No "you should plant now" / "you're outside the window" judgments** in v1.
- Schedules and timelines are derived purely from the user's own numbers (arithmetic on
  dates), which is deterministic, explainable, and offline.

## Consequences

- Removes the bundled-data liability and the blocking need for a reference-data research
  pass. v1 is dramatically simpler and faster.
- Keeps the app domain-agnostic — it works for any climate/region because the user brings the
  knowledge. (Better for a future broad audience, too.)
- Puts the burden of correct numbers on the user. Acceptable: the owner *wants* to own that,
  and it mirrors how garden journals already work.
- Leaves the door open to *optional* future intelligence (e.g. a community crop-data pack, or
  AI suggestions) as an add-on — but never as a requirement, and never silently authoritative.

## Alternatives considered

- **Bundle region-specific planting intelligence (UF/IFAS, zones, frost dates)** — rejected by
  the owner's steer; high curation liability, region-locked, and blocks the build on data
  research. Its value can instead live in the user's own entered numbers.
