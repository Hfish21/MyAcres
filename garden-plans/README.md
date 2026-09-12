# garden-plans/

A **personal, git-ignored library** for `.homestead` files — the owner's real garden
plans. This is data, not code: everything in this folder is ignored by git except this
README, so real plans live here on the machine but never get committed.

The `.homestead` file is sacred (see the root `CLAUDE.md`) — it's the portable file the
app reads and writes. Keep backups of anything you care about.

## What lives here

| File | Role |
|---|---|
| `master-template.homestead` | The **pristine master template** — the curated crop library (best varieties for the area), with no spaces or plantings. Open it to start a new plan; **never overwrite it**. |
| `myacres-garden.homestead` | Regenerable output of `scripts/generate-garden-seed.mjs` — the source of truth for the crop library. Safe to delete/regenerate. |
| `NNNN-garden.homestead` | Year- or season-specific working plans (e.g. `2026-garden.homestead`) — a copy of the master with your spaces and plantings filled in. |

## Workflow

1. Open **`master-template.homestead`** in the app (file controls → open).
2. Add your growing **spaces** and this year's **plantings**.
3. **Save As** a year-specific file here, e.g. `2026-garden.homestead`, so the master
   stays clean for next season.

## Editing the crop library

The library is generated, so edit it reproducibly rather than by hand:

```bash
# edit the crop list in scripts/generate-garden-seed.mjs, then:
node scripts/generate-garden-seed.mjs   # writes garden-plans/myacres-garden.homestead
cp garden-plans/myacres-garden.homestead garden-plans/master-template.homestead
```
