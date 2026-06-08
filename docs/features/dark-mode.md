# Feature: Coffee Dark Mode

- **Module:** core (shell)
- **Status:** Shipped
- **Related ADRs:** ADR-0007 (Paper Desktop design language, §2.4 dark-mode note)
- **Last updated:** 2026-06-07

## Summary

A warm, coffee-toned dark theme for the whole app — "warm desk lamp at night," per
ADR-0007 §2.4. Not a black/gray OLED theme: an espresso-brown desktop with
roasted-coffee window bodies, mocha title bars, and warm-cream text, keeping the
notebook/Paper-Desktop aesthetic after dark. A toggle in the top bar switches modes;
the choice persists, and first-run follows the OS preference.

## User stories

- As a homesteader planning at night (or who just prefers dark UIs), I want a dark theme
  that's easy on the eyes but still feels like MyAcres, so the app is comfortable in any light.
- As a returning user, I want my theme choice remembered so I don't re-pick it each visit.

## Behavior

- A sun/moon button in the top-bar chrome toggles light ↔ dark.
- **First run:** no saved choice → follow the OS `prefers-color-scheme`.
- **After a manual choice:** the selection is saved and always wins over the OS preference.
- **No flash:** an inline `<head>` script applies the `dark` class before first paint, so the
  page never flashes light-then-dark on load.
- `prefers-reduced-motion` is respected by the existing global transitions (unchanged).

## Data

None. Theme is a UI preference only — it is **not** written to the `.homestead` file
(the file stays portable and device-agnostic). The choice lives in `localStorage`
under the key `myacres-theme` (`"light"` | `"dark"`).

## UI / UX

- **Toggle:** a 32px ghost button in the top bar (left of the file controls). Shows a moon in
  light mode, a sun in dark mode. Labelled for screen readers (`aria-label`).
- **Theming mechanism:** a single `:root.dark` block in `globals.css` overrides the raw Paper
  Desktop tokens (surfaces, ink, accents). Because `.dark` lands on `<html>` (= `:root`), the
  shadcn semantic aliases recompute automatically — no per-component dark variants needed.
  Bright accent fills (rust/barn) take dark text in dark mode via `--*-foreground` overrides.
- **Contrast:** key text tokens verified WCAG AA+ on their dark surface (ink ≈ 13.8:1,
  ink-2 ≈ 7.6:1, ink-3 ≈ 4.6:1; rust/barn text on canvas ≥ 4.5:1).
- The garden-canvas crop-dot palette is unchanged — those mid-tone earth colors read on both
  the cream and the espresso bed surfaces.

## Out of scope

- Persisting the theme in the `.homestead` file or syncing it across devices.
- A third "system/auto" tri-state toggle (the OS pref is only the *initial* default).
- A separate "max contrast" accessibility toggle (noted in ADR-0007 §7; not built here).
- Re-tuning the crop-dot palette per theme.

## Acceptance criteria

- [x] Toggle in the top bar switches the whole app between light and coffee dark mode.
- [x] Choice persists across reloads (`localStorage`).
- [x] First run with no saved choice follows the OS `prefers-color-scheme`.
- [x] No light-then-dark flash on load.
- [x] All views (Plan, Layout, Crops, Spaces, Plantings) render correctly in dark mode.
- [x] Key text meets WCAG AA on dark surfaces.
- [x] `pnpm lint` and `pnpm build` pass.
