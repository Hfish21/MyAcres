# Feature: Spaces & the Layout Editor

- **Module:** garden · **Status:** Shipped · **Routes:** `/spaces` (list), `/layout` (canvas)
- **Related:** [ADR-0009](../decisions/0009-space-planting-model.md)

## Summary

**Spaces** are the places things grow — beds, rows, containers, ground. Each is a **polygon**
measured in feet; capacity for a crop = the space's area ÷ the crop's spacing. Two views manage
them: a simple **list** (`/spaces`) and a visual **Layout editor** (`/layout`) where you draw your
garden to scale and see what's planted where, over time.

## Data — the `Space` entity (`src/lib/garden/schema.ts`)

`name`, `type` (bed/row/container/ground/other), `shape` (`{ points: [{x,y}] }` — **absolute
canvas coordinates in feet**), `capacityOverride?`, `sun?`, `notes?`, timestamps. Area is derived
via `polygonArea`; there is **no separate position field** — the polygon's points are its place on
the canvas.

## Behavior

### `/spaces` — list (CRUD)
Ledger table (name, type, size LxW, area, sun) with a rectangle-first add/edit dialog (enter
length × width → a rectangle polygon), filters, and cascade-aware delete.

### `/layout` — the editor (`src/components/layout/`)
An **SVG dot-grid canvas** (coordinates in feet). Desktop-editable, mobile read-only.
- **Draw mode:** click to drop polygon corners (snap to the foot); close near the first corner (or
  Finish) → creates a Space and opens its details popup. **Live dimensions** render as you draw —
  each edge shows its length (`9 ft`) and the running polygon area shows as a bold rust chip
  (`≈ 68 sq ft`, approximate until closed), so you can lay out a bed to size.
- **Select mode:** click a space to **drag** it (snaps), **Copy**, **Delete** (cascade-confirm),
  or **Edit** details (name/type/sun/capacity/notes; area shown).
- **Plant density & maturity:** each space fills with **per-crop glyphs**, packed at the crop's
  spacing up to capacity (`packPositions` + `pointInPolygon`) — organizational, not pixel-accurate,
  packed into a slightly **inset** polygon to keep a margin off the border. Each glyph reflects the
  planting's **lifecycle stage on the scrubbed date** (`stageOn`): *establish* = a small seed,
  *growing* = a leafy crop-coloured three-leaf sprout, *harvest* = the sprout with a **vivid
  ripe-red fruit** (the `ripe` token, with a theme-background ring) nestled in it — chosen to pop
  against any crop-colour foliage, including amber crops. Drag the date scrubber and the bed
  visibly matures, then lights up with ripe fruit as crops come ready. Glyphs degrade gracefully to
  small marks at high density.
- **Bed nameplate:** each space's name + derived area sit in a compact two-line pill **floating
  just above** the bed's top-left corner — kept clear of the plantings so the label is always
  legible (it previously sat centered, on top of the dots). The pill picks up the rust border when
  the bed is selected.
- **Framing & scale:** the viewBox frames the actual content with a small margin (no forced
  minimum / origin anchoring, so there's little dead space), capped at `72vh` tall. A small
  **scale bar** anchored bottom-left states the grid's foot scale. Beds show a hover fill in
  Select mode.
- **Date scrubber:** an as-of slider; only plantings whose lifecycle spans that date are shown, so
  beds **fill, empty, and swap crops across the season** (`plantingActiveOn`).

## Components & helpers
`src/app/{spaces,layout}/page.tsx`; `src/components/spaces/*`, `src/components/layout/{garden-canvas,layout-toolbar,date-scrubber,space-detail-dialog}.tsx`;
geometry in `src/lib/garden/geometry.ts`, colors in `colors.ts`.

## Out of scope / future
Editing a polygon's vertices after drawing (delete + redraw for now), true curves/ovals,
pan/zoom, dragging individual plants, multi-select, and time-aware *capacity* (succession).
