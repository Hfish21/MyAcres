# ADR-0003: File-first storage, no database

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden

## Context

A defining quality of BudgetOnTarget — which the owner wants to preserve — is that a normal
person can open a web page and use the app on their own machine, with their data stored in a
portable file they own (`.budget`). No account, no server, no install. The data volume for a
homestead app is modest and doesn't need fast or concurrent read/write.

The owner's requirement: **no traditional database**; keep a file structure to hold the data
and preserve the "coolness" of BudgetOnTarget. He's agnostic about the exact mechanism, and
floated Notion-as-a-backend as an option.

## Decision

We will store all data in a **single portable file** — `.homestead` (JSON) — and treat
storage as a **swappable core service with a file-first default**. The file is loaded/saved
via the File System Access API where available, with a download/upload fallback elsewhere
(the BudgetOnTarget pattern).

The **core experience requires no backend, no APIs, and no install.** Anything external —
cloud sync, a Notion adapter, sensors, weather APIs — is an **optional add-on** layered on
later via the storage adapter or module APIs, never a dependency for using the app.

Notion-as-a-backend is explicitly **not** the foundation. It may be offered later as one
optional sync adapter for the owner's convenience, but file-first stays the default because
it (a) needs no account/token setup and (b) keeps the future open-source/SaaS path free of a
third-party dependency for every user.

## Consequences

- The app works fully offline; the data is genuinely portable and owned by the user.
- The user's `.homestead` file is sacred: git-ignored, never committed, never destroyed.
- We take on **schema migration** responsibility on a single evolving file. Mitigated with
  two-level versioning (core + per-module), forward-only per-namespace migrations,
  preserve-unknown-modules-on-save, and back-up-before-migrate (see architecture overview).
- No multi-device sync out of the box — the file *is* the sync mechanism (hand it around,
  put it in your own Dropbox, etc.). Real sync is a future optional adapter.
- No server costs; static hosting only.

## Alternatives considered

- **Traditional database (SQLite/Postgres) + backend** — rejected by requirement; kills the
  open-a-URL-and-go portability and adds hosting/ops.
- **Browser IndexedDB as the primary store** — viable for offline, but makes the data less
  obviously portable (it's locked in a browser profile). File-first keeps the data tangible
  and movable; IndexedDB may still be used as a cache/working layer if needed.
- **Notion (or similar) as the backend of record** — rejected as the default: adds account +
  API-token friction (breaks "normal person opens a webpage") and couples every future user
  to a third party. Kept as a possible optional adapter only.
