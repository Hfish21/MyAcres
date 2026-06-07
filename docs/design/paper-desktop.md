# MyAcres Design Language — "Paper Desktop"

_Status: **Accepted** — locked as the MyAcres design language (see [ADR-0007](../decisions/0007-design-language-paper-desktop.md)) · Date: 2026-06-06 · Owner-approved 2026-06-06_

This is the **authoritative design specification** for MyAcres. It went through one
course-correction: an earlier draft ("Almanac Terminal") leaned too hard into a green-screen /
command-line look; this version keeps what was right (warm paper, flat-and-square, monospace as
a software texture, the ledger number discipline) and re-aims the whole thing at a **retro
graphical-desktop / "old OS" GUI** read, in the spirit of **PostHog's website** — flat
application windows on warm paper, friendly and a little nostalgic, never a high-contrast
terminal. Section 12 (open questions) is retained as a record; their resolved outcomes are
captured in ADR-0007.

Plain-language rationale is included throughout, on purpose — the goal is to build a shared
vocabulary, not to sound like a design textbook. Where a term might be unfamiliar, it's
explained inline.

> **How to read this:** Section 0 is the one-sentence north star. Section 1 is the single
> biggest change — the **window/panel pattern** that's now the centerpiece. Sections 2–8 spec
> the rest (palette, type, components). Section 9 shows redone mockups. Section 11 is a plain
> "what changed from v0 and why" so you can see your feedback reflected. React at any level —
> "warmer," "too busy," "love the windows, hate X" are all useful notes.

---

## 0. The north star, in one sentence

**An old desktop application, redrawn flat and warm:** cream-paper canvas, squared "windows"
with flat title bars, thin honest borders and no gloss, a clean sans for reading, and monospace
used as a *software texture* for data and labels — friendly, a little nostalgic-playful,
pragmatic. It records and shows; it never lectures.

Think the feeling of opening a tidy program on an old computer — **but flat, in paper colors**,
not the glossy 3-D candy of Windows XP "Luna" / Aero. We want XP-era **squareness and windowed
structure**; we explicitly do **not** want gloss, bevels, gradients, or glow.

Three ingredients, blended:

1. **Desktop-GUI windows** — sections are squared panels with a flat title bar across the top.
   The whole app reads like a small, well-organized old program, not a scrolling web page and
   not a terminal printout. *(This is the new dominant motif — see §1.)*
2. **Warm paper palette** — cream canvas (never stark white), white-ish panels that sit one
   step *toward* white, muted earthy accents (rust, olive, amber, ochre, barn red, faded blue).
   Low-glare, analog, readable outdoors.
3. **Monospace as flavor, not gimmick** — mono carries data, numbers, labels, and the ledger
   column alignment, which gives the app its "software" texture. **Prose and most UI text are a
   clean humanist sans**, so it never reads as a green-screen terminal.

What we are **not**: (a) the cold fintech-SaaS look of BudgetOnTarget (bright white, soft
shadows, friendly blue) — different personality on purpose; and (b) the v0 terminal intensity —
stark ink-on-paper, mono *everywhere*, heavy ASCII. We softened both.

### Grounding: what PostHog actually does (so this isn't guesswork)

PostHog's site is the clearest real example of this "flat retro desktop on warm paper" read,
and it confirms the direction concretely:

- **Warm cream canvas, not white** — their page background is `#eeefe9` (a warm cream), with
  cards sitting one step *up* on near-white. We do the same.
- **Flat cards, no shadows** — "No drop-shadow elevation… Cards sit flat on cream with thin
  olive borders." Elevation is communicated by border + tone, never by a floating shadow.
  This matches our flat-and-square rule exactly.
- **Thin neutral borders + small radius** — 1px hairline borders (`#bfc1b7`), ~6px corner
  radius on cards/buttons. Soft-square, friendly — not the 0px hard brutalism of v0.
- **Comfortable, not severe, contrast** — their body text is an olive-*gray* (`#4d4f46`) on
  cream, not pure black. Readable, but not stark. This is our gauge for "lower the contrast"
  without going muddy.
- **Sans-serif primary, monospace reserved** — IBM Plex Sans for everything, monospace only
  for code/technical chips. Hierarchy comes from font *weight*, not from size or heavy rules.
- **One saturated accent** — a single yellow-orange pill (`#f7a501`) carries primary actions;
  everything else is muted earth tones and soft pastel callout bands.
- **Actual desktop-OS metaphor** — the site is literally a windowed OS (file-explorer-style
  nav, title-barred windows, a document-editor look). They did it to make multitasking and
  page-distinctness better, framed as "pragmatic with playful elements." That windowed
  structure — flat and warm — is exactly what we're adopting as our centerpiece.

Sources: [PostHog design tokens (community DESIGN.md)](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/posthog/DESIGN.md),
[PostHog — "Why our website looks like an operating system"](https://posthog.com/blog/why-os).

### On the name

v0 was "Almanac Terminal" — but "terminal" is precisely the word we're moving away from. I'm
renaming the direction **"Paper Desktop"**: *paper* keeps the warm-almanac soul, *desktop*
names the new windowed-GUI centerpiece. (Alternatives considered: "Homestead OS" — cute but
over-promises an OS we aren't building; "Paper OS" — fine, slightly more abstract. "Paper
Desktop" is the most literal description of the look: a desktop app, on paper.) Open to a vote
in §12 — the name is cheap to change.

---

## 1. The window / panel pattern — the new centerpiece

This is the single biggest change from v0, so it leads. **Every meaningful section of the app
is drawn as a flat "window"** — a squared panel with a title bar across the top. This replaces
v0's heavy "ink panel header bar" (a black strip with cream text) as the dominant motif. The
window is friendlier, more nostalgic, and scales perfectly to future modules (each module, each
sub-view, is just another window).

### 1.1 Anatomy of a window

```
┌─────────────────────────────────────────────┐
│ ▢  TASKS DUE                          ─  ☐   │  ← title bar (flat fill, not ink-black)
├─────────────────────────────────────────────┤
│                                               │
│   …window body: cards, lists, the content…   │  ← body sits on near-white panel
│                                               │
└─────────────────────────────────────────────┘
```

- **Frame:** 1px solid border in a warm neutral (`line` token, §2), **6px corner radius**,
  **no shadow**. The window is a flat shape on the cream canvas — it's a panel because it has a
  border and a slightly lighter fill than the canvas, *not* because it floats.
- **Title bar:** a flat horizontal strip at the top of the window. Fill is `titlebar` (a soft
  warm tan, §2) — **not** ink-black like v0's header. Title text is the window's name in
  **monospace, uppercase, letter-spaced** (`TASKS DUE`, `GARDEN — TIMELINE`). This is the one
  place mono earns a prominent role: it's the "app chrome" voice, and it reads as "this is
  software" without shouting terminal.
- **Title-bar left glyph (optional, subtle):** a tiny squared icon slot (`▢`) on the left, like
  an old window's program icon. Use a simple Lucide line icon per module (a sprout for Garden).
  Decorative, low-emphasis — not required.
- **Title-bar right controls (decorative-but-functional where real):** small squared
  affordances on the right, e.g. a collapse/expand control (`─` / `+`) where a panel actually
  collapses, or a window-menu (`⋯`). **Important honesty rule:** only draw a control if it does
  something. We are *evoking* window chrome, not faking dead buttons. A purely decorative
  "close box" that does nothing would be a lie — skip it. (This keeps us aligned with the
  tool-not-oracle / honest-UI ethos.)

### 1.2 How windows nest and scale

- **Top level = the desktop.** The app canvas (cream) is the "desktop." Modules and views are
  windows arranged on it. On desktop screens this can be a multi-window dashboard; on mobile,
  windows stack vertically full-width (they don't literally float/drag on a phone — see §1.4).
- **A module is a window; its sections are windows-within.** The Garden module is a window;
  inside it, "Tasks Due," "Ready to Harvest," "Growing Now" are each their own smaller window
  (or, on mobile, stacked windows). This gives a consistent, recursive rule: *anything that is
  a distinct chunk of content gets a window.* A future Livestock or Equipment module is just a
  new window with the same chrome — **zero new design needed to add a module.** That's the
  whole point.
- **Inner content uses lighter "cards," not more title bars.** To avoid title-bar overload,
  only the window gets a title bar. Items *inside* a window (a single task row, a single crop)
  are plain bordered cards or ledger rows (§5), not mini-windows. Rule of thumb: **title bars
  name a section; cards hold an item.**

### 1.3 Why this works for us

- It's instantly legible and a little nostalgic — "oh, it's like a little program" — which is
  exactly the friendly-pragmatic tone we want.
- It's flat and square, so it satisfies the no-gloss / no-shadow constraint by construction.
- It's the cleanest possible **module container**: the shell + modules architecture
  (ADR-0005) maps 1:1 onto "desktop + windows." The design language and the code architecture
  now tell the same story.

### 1.4 Mobile behavior (the primary outdoor surface)

On a phone we keep the *look* of windows but not the literal desktop interaction:

- Windows become **full-width stacked panels** — same border, radius, and title bar, just one
  per row, scrolling vertically. No dragging, no overlap (that's a desktop affordance).
- The title bar stays (it's the section header), but right-side window controls reduce to at
  most a collapse toggle.
- Everything stays one-handed and ≥44px tap targets (§7). The mobile dashboard is windows in a
  single column; the desktop dashboard is windows in a grid.

---

## 2. Color palette

Design principle, updated for this redo: **warm and comfortable, but never muddy.** v0's
guiding line was "muted ≠ low-contrast" with *stark* ink. The new line is **"softened, not
weakened":** we lower the *aesthetic severity* (warmer paper, near-white panels, a charcoal
that's a touch lighter than v0's near-black, hierarchy carried by weight not by black bars) —
**but body and label text still meet WCAG AA against their surface**, gauged against PostHog's
own comfortable-but-readable contrast. Every value below was contrast-checked; ratios listed.

### 2.1 Surfaces (the paper — softened, with a near-white panel added)

| Token | Hex | Use | Changed from v0? |
|---|---|---|---|
| `canvas` | `#F2ECDD` | The "desktop" — app background. Warm cream, slightly **softer/lighter** than v0. | Softened (was `#F4EEE1`). |
| `panel` | `#FBF7EE` | **Window body** — sits one step *toward white* from the canvas, like PostHog's white-on-cream cards. The window reads as "lifted" by being lighter, not by shadow. | **New surface** (v0 made panels *darker* than canvas; this is the bigger shift — windows are now the bright surface). |
| `titlebar` | `#E4DBC5` | Flat **window title-bar** fill — soft warm tan. | **New** (replaces v0's ink-black header strip). |
| `inset` | `#E7DFCD` | Subtle fills: table zebra rows, hover on panel, disabled wells. | Renamed/softened (was `paper-200/300`). |

Plain-language: in v0, a panel was a *darker* patch than the page. Now it's the reverse — the
**window body is the lightest surface** (near-white), the canvas behind it is cream, and a thin
tan title bar caps it. That single inversion is what turns "ink panel on paper" into "bright
window on a desk."

### 2.2 Ink (text & borders — warm charcoal, eased off pure-black severity)

| Token | Hex | Use | On `canvas` | On `panel` |
|---|---|---|---|---|
| `ink` | `#2A2620` | Primary text, headings. Warm charcoal — **lighter than v0's near-black**, so it reads "printed," not "stark." | **12.8 : 1** (AAA) | **14.1 : 1** (AAA) |
| `ink-2` | `#544D40` | Secondary text, labels, title-bar text. | **7.1 : 1** (AAA) | **7.8 : 1** (AAA) |
| `ink-3` | `#6E6655` | Muted/meta text, placeholders, timestamps. | **4.8 : 1** (AA) | **5.3 : 1** (AA) |
| `line` | `#C9BDA2` | **Window & card borders, hairlines.** Warm neutral, visible but not heavy. | (decorative) | (decorative) |

We still use a warm charcoal (`#2A2620`), not `#000` — pure black on cream looks harsh and
"digital." v0's ink was `#1C1A17` (nearly black); easing it to `#2A2620` keeps AAA on both
surfaces while dropping the terminal-severity. This is the "lower the contrast" feedback,
applied responsibly: still 12.8:1, still great in sun — just not *stark*.

The **border** is the headline change in this section: v0 used a 1.5px near-black border on
everything (very crunchy). We move to a **1px warm-neutral border** (`#C9BDA2`), matching
PostHog's thin hairline. Hierarchy now comes from the *title bar* and *tone*, not from a heavy
black outline.

### 2.3 Earthy accents (semantic roles — palette unchanged, contrast re-verified)

The accent *roles* and most hexes carry over from v0 (they were right, and they map to the
homestead's mental model). Re-verified against the new, slightly-lighter canvas:

| Role | Name | Fill | Text on fill | On-paper text | Meaning |
|---|---|---|---|---|---|
| **Primary** | Rust | `#9C4A2E` | `canvas` (5.2:1) | `#9C4A2E` (5.2:1) | Primary actions, brand, active nav. The one saturated accent (our "yellow pill"). |
| **Growing** (success) | Olive | `#5A6B3B` | `canvas` (5.0:1) | `#4C5A32` (6.3:1) | "Growing / on track / done." Muted healthy-plant green. |
| **Harvest** | Amber | `#C97A1A` (fill) | **`ink` on fill (4.5:1)** | `#9A5B12` (4.6:1) | Ripe / "ready to pick." Harvest log. *Amber fill needs dark text, not paper text.* |
| **Warning** | Ochre | `#D9A93C` (fill) | `ink` on fill (6.9:1) | `#7E6019` (5.0:1) | "Check this," overdue-soon. *On-paper ochre text uses the darker `#7E6019` to clear AA.* |
| **Danger** | Barn red | `#8B2E22` | `canvas` (7.1:1) | `#8B2E22` (7.1:1) | Destructive actions, overdue, errors. |
| **Info / neutral** | Faded blue | `#3E5A6B` | `canvas` (6.2:1) | `#3E5A6B` (6.2:1) | Neutral highlights, "today" marker, info notes. The one cool note. |

**Soft callout tints (new — PostHog-style):** for info/note/success/warning *banners* inside a
window, use a soft pastel band (a low-saturation tint of the accent) with the dark accent text
on top — e.g. a pale-blue band for info, pale-olive for success. This is a gentler, more
"desktop dialog" way to flag things than v0's hard-bordered colored boxes, and it reads as
friendly rather than alarming. (Derive tints from the accents at ~12–15% saturation on `panel`;
exact tints to be tuned with the Frontend agent once a base is in code.)

**Why the same six accents:** unchanged from v0 and still right — rust = tool/brand, olive =
living plant, amber = ripe fruit, ochre = attention, barn = stop/danger, faded blue = neutral
marker. A future Livestock module reuses the *same* roles with zero new colors. That system
scaling is preserved.

### 2.4 Dark mode (still deferred to v1.1 — note only)

Same recommendation as v0: defer. When built, go "warm desk lamp at night," not pure-black
OLED. Canvas → a warm near-black desk (`#1F1C17`), panels a step up (`#262219`), title bars a
warm tan-charcoal, text warm cream. Accents lighten one step to hold contrast. Keep the window
borders visible so the windowed structure survives in the dark. A note, not a spec.

---

## 3. Typography

### 3.1 The rule (updated — this is a real change)

v0: *"The app speaks in monospace; the user writes in a humanist font"* — mono was the system
voice **everywhere**. The owner's feedback ("not directly terminal-inspired… more PostHog")
means mono should be **flavor, not the whole voice.** Revised rule:

**The app reads in a clean humanist sans. Monospace is the data-and-chrome texture.**

Concretely:
- **Sans (humanist)** is the default for almost everything a person *reads*: body text, prose,
  most labels, descriptions, buttons, nav, empty-state copy. Comfortable, modern, warm.
- **Monospace** is reserved for the "software texture" — the places where the grid alignment and
  the retro feel pay off: **window title bars**, **numbers/quantities/dates** (tabular,
  ledger-aligned), **data tables and the timeline**, status badges, and short code-like chips
  (`DTM 68`, bed IDs like `N-2`). Mono is now a *spice*, applied where it has a job, not the
  base flavor.

This keeps the core good idea from v0 — *mono gives the data its ledger rhythm* — while ending
the "green-screen everywhere" read. It also matches PostHog (sans primary, mono for the
technical bits) and the v0-owner balance note: keep the terminal *type style* as flavor.

### 3.2 Font choices

**Primary sans (humanist) — recommend `Inter` or `IBM Plex Sans` (both free).**

- **IBM Plex Sans** — PostHog's choice; warm, slightly humanist, excellent legibility, pairs
  naturally with IBM Plex Mono (designed together). **Recommended** — it nails the
  friendly-pragmatic-software tone and gives us a matched mono for free.
- **Inter** — the safe, ultra-legible modern default; a hair more neutral/corporate than Plex.
  Strong alternative if Plex feels too "techy."

**Primary monospace — recommend `IBM Plex Mono` (free).**

- **IBM Plex Mono** — matched to Plex Sans, warm, very readable at small sizes (good for sun).
  **Recommended** to pair with Plex Sans.
- **Commit Mono / JetBrains Mono** — fine fallbacks; both slightly more "developer-tool."

**Optional retro display face — `Departure Mono` (free, pixel/retro): now strictly optional and
minimal.** v0 floated it for headers/wordmark. Per "don't go too hard in the paint," demote it
to **at most the wordmark/logo lockup**, and only if the owner wants a pinch of pixel
nostalgia. **Default: don't use it.** Never set body, data, or title bars in a pixel font
(hurts sun legibility, and pushes us back toward gimmick).

**CSS font stacks (for the Frontend agent):**

```
--font-sans:    "IBM Plex Sans", "Inter", system-ui, sans-serif;   /* the default voice */
--font-mono:    "IBM Plex Mono", "Commit Mono", ui-monospace, monospace;  /* data + chrome */
--font-display: "Departure Mono", var(--font-mono);  /* OPTIONAL, wordmark only */
```

### 3.3 Type scale

Hierarchy is built **from weight contrast more than size** (the PostHog lesson — and it keeps
the scale calm, like a tidy app). Base body = **16px** (never below 14px for outdoor text).

| Token | Size / line-height | Weight | Font | Use |
|---|---|---|---|---|
| `display` | 28 / 34 | 700 | sans | App/module title, big headers. |
| `h1` | 22 / 28 | 700 | sans | Page titles. |
| `title-bar` | 14 / 20 | 600 · uppercase · `tracking-wide` | **mono** | Window title-bar text. |
| `h2` | 18 / 24 | 700 | sans | Sub-section headers inside a window. |
| `body` | 16 / 24 | 400 | sans | Default reading text, labels, list rows. |
| `body-strong` | 16 / 24 | 600 | sans | Emphasis without size change (the weight-contrast move). |
| `small` | 14 / 20 | 400 | sans | Meta, timestamps. Floor for outdoor text. |
| `num` | 16 / 24 | 500 · `tabular-nums` | **mono** | Quantities, dates, counts — always tabular so columns align. |

**Rules:**
- **Window title bars** are mono + uppercase + letter-spacing — that's the deliberate retro
  flavor, concentrated in the chrome.
- All numbers use `tabular-nums` (mono) so ledgers and the timeline align to a grid. **This is
  the single most important detail carried over from v0** — it's what gives the data its
  honest ledger rhythm, and it survives unchanged.
- Prefer **weight** over size for emphasis; keep the scale small. Restraint is the aesthetic.

---

## 4. Layout, grid & density

### 4.1 The ledger rhythm (kept — it was right)

Still a signature, now expressed inside windows rather than across a terminal screen:

1. **Column alignment via tabular mono.** Lists and tables align in true columns: a label
   column, a tabular-number column, a status column. "3 days" and "12 days" line up without
   fiddling. This is the ledger look, and it stays.
2. **Lighter section rules.** v0 leaned on literal ASCII rules (`├──`, `─────`) for dividers.
   Per "ease off the heavy flourishes," **prefer a thin 1px `line` rule** for dividers; reserve
   ASCII glyph rules for the rare spot where they genuinely add charm (e.g. a legend). The
   window's title bar now does most of the "section header" work that heavy rules did in v0.

### 4.2 Spacing scale (8px base, 4px half-steps — unchanged, slightly roomier defaults)

Tailwind's default 4px scale fits. PostHog's generous section rhythm (big gaps between blocks)
nudges us a touch roomier than v0's "medium-dense."

| Step | px | Typical use |
|---|---|---|
| `1` | 4 | Tight inner gaps, badge padding. |
| `2` | 8 | Compact row inner padding. |
| `3` | 12 | Input padding, list-row rhythm. |
| `4` | 16 | Card padding (mobile), title-bar height padding. |
| `6` | 24 | **Window body padding (default)**, card padding (desktop). |
| `8` | 32 | Gap between stacked windows. |
| `12` | 48 | Page top/bottom breathing room; gap between major desktop window groups. |

**Density:** medium — windows have comfortable 24px body padding (PostHog uses 24px card
padding); data *tables inside* windows stay denser. Roomier than v0 overall, per the "more
space / less severe" read. Tap targets stay generous (§7).

### 4.3 Responsive grid

- **Mobile-first, single column** (`< 640px`): windows stack full-width, bottom nav bar. Primary
  outdoor surface; one-handed.
- **Tablet** (`640–1024px`): two-column window layout where it helps.
- **Desktop** (`> 1024px`): the **planning surface** — a multi-window dashboard on the cream
  "desktop." Timeline/Gantt and bed-planner get full-width windows. 12-col grid, max content
  ~1280px (matches PostHog), centered.
- **Prose max-width:** ~68ch for journal readability.

---

## 5. Component patterns

Global rules (the updated, softer contract — note how this differs from v0's brutalist one):

- **Flat, with a thin border — no shadows, no gloss, no gradients.** Every window/card/control
  has a **1px solid `line` border**. Elevation = border + surface tone (panels are lighter than
  canvas), never a drop-shadow or glow.
- **Corner radius = 6px** on windows, cards, buttons, inputs (PostHog's card radius). Inline
  chips/badges = 4px. This is the friendly soft-square — a real change from v0's near-zero 2px.
- **Pressed state = a simple flat color shift** (PostHog: primary darkens on press), not v0's
  brutalist "slam onto a hard offset shadow." The slam is demoted to optional (§5.1).

### 5.1 Buttons

- **Primary:** rust fill (`#9C4A2E`), `canvas` text, 6px radius, **no border needed** (the fill
  carries it; an optional 1px darker-rust border is fine). Min height 44px (mobile 48px). On
  press, fill darkens one step.
- **Secondary:** `inset` fill (`#E7DFCD`), `ink` text, 1px `line` border, 6px radius.
- **Destructive:** barn-red fill, `canvas` text.
- **Quiet/ghost:** no fill, `ink` text, border appears on hover.
- **Optional "slam" hero button (demoted):** v0 made a hard-offset brutalist button a
  *signature*. Per "don't go too hard in the paint," it's now **optional and rare** — at most
  one hero action (e.g. `LOG HARVEST`), and only if the owner specifically likes it. Default
  buttons are flat. The personality now lives in the *windows*, not in slamming buttons.

### 5.2 Inputs & forms

- Inputs: `panel`/white fill, 1px `line` border, 6px radius, 44px+ tall, `ink` text, `ink-3`
  placeholder. **Sans font** (mono only for numeric/code fields like a bed ID or DTM count).
- Labels: a clean sans label above the field. v0's terminal-prompt labels (`> CROP`,
  `LABEL....: value`) are **dropped as the default** (too terminal); keep dot-leader alignment
  only inside dense data readouts, not on forms.
- **Focus state:** 2px rust outline, `outline-offset: 2px` — clearly visible in sun, never
  removed. (PostHog uses a translucent focus ring; a solid rust ring is more sun-legible for
  us.)
- **Validation:** inline text below the field — error in barn-red, success in olive — paired
  with a small Lucide icon (not an ASCII `[!]` by default; see §6). Honest and plain.
- Checkboxes/radios: squared, 1px border, 6px radius; checked = rust fill with a simple check
  (SVG, not `[x]`).

### 5.3 Windows / panels / cards (the centerpiece — see §1 for full anatomy)

- **Window:** `panel` (near-white) body, 1px `line` border, 6px radius, flat `titlebar` strip
  with mono uppercase title, 24px body padding (16px mobile). **No shadow.**
- **Plain card (an item inside a window):** `panel` or `inset` fill, 1px `line` border, 6px
  radius, no title bar. Used for a single task, a single crop row group.
- Interactive card hover: border darkens slightly or fill shifts to `inset`. **No
  hover-elevation / shadow-on-hover.**

### 5.4 Tables / lists (the ledger — kept as core, lightened)

The data heart, still strong, now living inside windows:

- Mono numbers, tabular, true column alignment. Label/text columns can be **sans** (more
  readable) with **mono only on the numeric columns** — a softer mix than v0's all-mono table.
- Header row: `ink-2` text, uppercase, `tracking-wide`, 1px `line` bottom border.
- Rows: 1px `line` hairline separators; optional `inset` zebra. Row height ≥ 44px. Right-align
  numerics.
- Status as a **badge with a label** (§5.6), never color-alone.
- Mobile: a wide table collapses to **stacked label/value rows** rather than horizontal scroll.

### 5.5 Navigation

- **Shell module switcher (desktop):** the windowed metaphor gives us a natural home — a left
  rail or a top strip of modules, sans labels with a small icon, active = rust. The future-module
  `+` affordance lives here from day one (adding Livestock = a new window, no nav redesign).
  *(Optional flavor: this strip can read like an old OS "taskbar/Start" — but keep it flat and
  restrained, not a gloss bar.)*
- **Mobile bottom bar:** 3–5 items, the two highest-frequency actions first-class. Keep v0's
  **center action button** (`＋ LOG`) that opens a quick sheet for the top two actions
  (Log Harvest / Complete Task) — guarantees ≤2 taps. Tabs: `Today · Garden · ＋LOG · Journal ·
  File`. Icon + sans label, 48px targets, active = rust.
- **Top bar (mobile):** thin context line (`Garden › Today`) + the file save-state indicator
  (data is a file the user owns — show saved/unsaved clearly).

### 5.6 Badges / tags

- Squared, 4px radius, 1px border, **sans uppercase** (mono optional for code-like tags),
  `small` size.
- Two styles: **soft** (pastel tint fill + dark accent text — the PostHog callout feel, now the
  default for status) and **solid** (fill + paper text) for high emphasis. Always pair color
  with a **label or icon** — never color alone (sun + colorblind).
- Examples: `GROWING` (soft olive) · `READY` (soft amber) · `OVERDUE` (solid barn red) ·
  `DONE` (outline ink) · `SEED` / `TRANSPLANT` (outline). Note these are now *softer* tints by
  default than v0's hard-bordered solids.

### 5.7 Timeline / Gantt (the planning signature — kept, reframed as a window)

The desktop showpiece, now drawn as a **window** ("GARDEN — TIMELINE 2026") rather than a raw
terminal chart:

- **Grid:** months across the top as a mono header row; crops down the left in a fixed label
  column. Month gridlines as 1px `line` hairlines — like graph paper inside the window.
- **Bars:** flat rectangles, 1px `line` border (softer than v0's 1.5px ink), 6px radius (a hair
  of softness vs v0's hard corners), filled by **stage** via the semantic palette: sow/in-ground
  = olive, growing = lighter olive, **harvest = amber** (the payoff — scan for amber to see when
  food comes in). No gloss, no gradient.
- **Pattern fill (optional, still recommended):** a subtle pattern per stage (dotted = germ,
  solid = growing, hatched = harvest) so stages read without color — colorblind- and
  sun-safe, and reads like an old printed chart. Kept from v0.
- **Today marker:** a single faded-blue vertical line labeled `TODAY` (a clean line + small
  label; the v0 `▼` glyph is optional).
- **Mobile:** degrade to a **vertical agenda per crop** ("Tomatoes — harvest: Sep–Jan") rather
  than a cramped horizontal chart. Data over chart, outdoors.

### 5.8 Empty states

Lean into the friendly-pragmatic voice — plain, warm, never an oracle. Now a clean window-body
message with one action, rather than a heavy ASCII box:

```
No plantings yet.
Add what you've put in the ground and we'll chart it.

[ + Add planting ]
```

(Optionally framed by a faint window/card border — but drop the v0 full ASCII `┌───┐` box as
the default; that was part of going "too hard.") Tone rule unchanged: **state the fact + offer
the action; never advise** ("you should plant now") — tool-not-oracle in the copy.

---

## 6. Iconography & motion

### 6.1 Icons

- **Style:** simple line icons, ~2px stroke, to match the thin borders. **Lucide** (ships with
  shadcn/ui, free) as the base, in `ink`/`ink-2`. **Icons are now the default** for status,
  actions, and validation — a friendlier, more "GUI" choice than v0's heavy ASCII reliance.
- **ASCII glyphs: now sparing.** v0 used `▸ ▾ ✓ ✗ ＋ ─ │ ├ ▼ [x] [!]` liberally as a signature.
  Per "much lighter use of ASCII glyphs," keep them only where they genuinely add retro charm
  and don't fight legibility — e.g. a window title-bar control (`─`/`+`), a timeline legend, a
  breadcrumb separator (`›`). Everywhere else, prefer a Lucide icon. This is a deliberate dial-
  down.
- **Don't** mix a glossy/duotone/colorful icon family in. One line set + a few glyphs.

### 6.2 Motion

**Restrained, friendly, fast** (PostHog is calm, not bouncy):

- Transitions: 120–160ms `ease-out` on color/border/opacity. No springs, no parallax, no
  fade-in-on-scroll.
- Buttons: a flat color shift on press (the v0 "1px translate / slam" becomes optional flavor,
  not the default).
- Windows that collapse/expand: a quick height/opacity transition (~150ms) — a gentle "window
  opening" feel, not a bounce.
- Respect `prefers-reduced-motion`: drop transitions, keep instant state changes.
- No skeleton shimmer; loading is rare (local file). If needed, a small `Loading…` is plenty.

---

## 7. Accessibility (and sunlight legibility)

Sunlight is an accessibility requirement, not a nice-to-have. Carried over from v0, re-verified
against the softened palette:

- **Contrast:** all body/label text meets **WCAG AA (≥ 4.5:1)** on its surface; primary text is
  AAA (12.8–14.1:1, see §2). The "lower contrast" feedback was applied to *aesthetic severity*
  (warmer paper, near-white panels, slightly lighter charcoal, weight-based hierarchy) — **not**
  to text legibility. We did not drop below AA anywhere; flagged the two accent-text edge cases
  (amber needs dark text on fill; on-paper ochre uses the darker `#7E6019`). An optional
  "max contrast" toggle can swap body text to the darkest ink and thicken borders for the
  brightest sun.
- **Don't encode meaning in color alone.** Every status carries a label or icon (badges,
  timeline patterns). Critical for sun-washed and colorblind use.
- **Tap targets:** ≥ 44×44px (48px for the two primary mobile actions and bottom-nav). ≥8px
  spacing between targets for gloves/one-handed use.
- **Focus:** always-visible 2px rust ring, `outline-offset: 2px`. Never `outline: none` without
  a replacement. Full keyboard operability on the desktop planning surface (Gantt + forms).
- **Window chrome a11y:** windows are landmarks/sections with the title bar as the accessible
  heading; collapse controls are real `<button>`s with `aria-expanded`; decorative-only chrome
  is `aria-hidden`. (Reinforces the §1.1 honesty rule — don't ship dead buttons.)
- **Text size:** 16px body floor, 14px absolute min outdoors; respect font-scaling (use `rem`).
- Semantic HTML, labelled inputs, `aria-live` for save-state/validation, logical tab order.

---

## 8. Tokens summary (hand-off to Frontend)

A starter Tailwind theme extension — the concrete artifact the Frontend agent maps into
`tailwind.config.ts` / CSS variables once the direction is locked.

```js
// Paper Desktop — v1 tokens (draft)
colors: {
  // surfaces
  canvas:   '#F2ECDD',   // the "desktop" / app background (warm cream)
  panel:    '#FBF7EE',   // window body — lightest surface (near-white)
  titlebar: '#E4DBC5',   // flat window title-bar fill (soft tan)
  inset:    '#E7DFCD',   // zebra rows, hovers, wells
  // ink
  ink:      '#2A2620',   // primary text (warm charcoal, softened)
  'ink-2':  '#544D40',   // secondary text / title-bar text
  'ink-3':  '#6E6655',   // muted/meta
  line:     '#C9BDA2',   // window & card borders, hairlines (warm neutral)
  // accents
  rust:     '#9C4A2E',   // primary (the one saturated accent)
  olive:    '#5A6B3B',   // growing/success            (on-paper text: #4C5A32)
  amber:    '#C97A1A',   // harvest (fill; DARK text)  (on-paper text: #9A5B12)
  ochre:    '#D9A93C',   // warning (fill; DARK text)  (on-paper text: #7E6019)
  barn:     '#8B2E22',   // danger
  inkblue:  '#3E5A6B',   // info / today marker
},
fontFamily: {
  sans:    ['IBM Plex Sans','Inter','system-ui','sans-serif'],   // default voice
  mono:    ['IBM Plex Mono','Commit Mono','ui-monospace','monospace'], // data + chrome
  display: ['Departure Mono','IBM Plex Mono','monospace'],        // OPTIONAL, wordmark only
},
borderRadius: { DEFAULT: '6px', chip: '4px', none: '0' },
borderWidth:  { DEFAULT: '1px' },
// no boxShadow tokens — flat, borders only. Spacing = Tailwind default (4px base).
// Soft callout tints (info/success/warning/danger banners) to be derived from accents
// at ~12–15% saturation on `panel`, tuned in code.
```

---

## 9. Signature-screen mockups (redone in the windowed-GUI style)

Structural/ASCII mockups (they show layout, hierarchy, voice — color/font come from §2–3). Note
how the dominant motif is now the **window with a flat title bar**, surfaces are
near-white-on-cream, mono is concentrated in title bars + numbers, and the heavy ASCII is
dialed back.

### 9.1 Garden Dashboard — "Today" (mobile, primary outdoor surface)

```
┌─────────────────────────────────────┐
│ Garden › Today              ◐ saved  │  ← thin top bar: context (sans) + file state
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▢  TASKS DUE                    ─    │  ← window title bar: tan strip, MONO uppercase
├─────────────────────────────────────┤
│  ⚠ Transplant tomatoes   [OVERDUE]  │  ← Lucide icon + barn-red badge (label, not color-only)
│    bed N-2                           │     'bed N-2' = mono chip; rest sans
│                          [ ✓ Done ]  │  ← 1-tap complete (44px), flat button
│  ─────────────────────────────────  │  ← 1px line divider (not ASCII)
│  ○ Water seedlings        [TODAY]   │
│    bed Greenhouse                    │
│                          [ ✓ Done ]  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▢  READY TO HARVEST             ─    │
├─────────────────────────────────────┤
│  Lettuce   bed N-1        [READY]   │  ← soft-amber badge
│  Beans     bed E-3        [READY]   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▢  GROWING NOW · 12             ─    │  ← count in title bar
├─────────────────────────────────────┤
│  Tomatoes   DTM 68  ▓▓▓░░  [GROWING]│  ← DTM mono+tabular, stage bar, soft-olive badge
│  Peppers    DTM 75  ▓▓░░░  [GROWING]│
│  Squash     DTM 50  ▓▓▓▓░  [GROWING]│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Today   Garden   ＋LOG   Journal  File│  ← bottom nav; ＋LOG = center action, sans labels
└─────────────────────────────────────┘
        (tap ＋LOG → quick sheet, a small window)
        ┌──────────────────────────┐
        │ ▢  LOG…              ─    │
        ├──────────────────────────┤
        │  [ Harvest ]             │   ← two top actions, ≤2 taps total
        │  [ Complete a task ]     │
        └──────────────────────────┘
```

What changed vs v0's 9.1: the black `████ TASKS DUE ████` ink header bars are gone — each
section is a **window with a soft tan title bar**; surfaces are near-white on cream; badges are
softer tints; labels/copy are sans, with mono concentrated in `DTM 68`, `bed N-2`, and the
title bars; ASCII is down to a single divider and the stage bar.

### 9.2 Planting Timeline / Gantt (desktop planning surface)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ▢  GARDEN — TIMELINE · 2026 season                      [ + Planting ]    ─  ⋯ │  ← window
├──────────────────────────────────────────────────────────────────────────────┤
│ CROP        BED   │ JAN  FEB  MAR  APR  MAY  JUN  JUL  AUG  SEP  OCT  NOV  DEC  │  ← mono header
│ ──────────────────┼───────────────────────────────│TODAY──────────────────────│  ← 1px gridlines
│ Tomatoes    N-2   │           ▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░         │
│ Lettuce     N-1   │ ░░░░░░              ░░░░░░                     ░░░░░░       │
│ Peppers     E-3   │             ▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░               │
│ Squash      S-1   │                  ▓▓▓▒▒▒▒▒▒▒▒▒▒░░░░░░░                       │
│ Garlic      W-2   │ ▒▒▒▒▒▒▒▒▒▒░░                            ▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Legend:  ▓ sow/plant   ▒ growing   ░ harvest window   │ month   | today        │
└──────────────────────────────────────────────────────────────────────────────┘
```

The chart now lives **inside a window** (title bar names it, a real `+ Planting` action and a
window menu sit in the chrome). Bars are flat rectangles with a 1px `line` border and a hair of
radius, filled by stage (olive → amber); **pattern encodes stage** (▓ sow, ▒ growing, ░
harvest) so it reads in B&W / colorblind / sun, with color layered for quick scanning. The eye
still lands on the **harvest (░/amber) runs** — the "when does food come in" answer. Left
columns are a fixed mono/tabular label grid; months are a mono header rule. Same almanac-chart
soul as v0, just wrapped in the friendlier window chrome and softened borders.

---

## 10. shadcn/ui recommendation (confirmed under the new direction)

**Recommendation: KEEP shadcn/ui, reskin via the Tailwind theme + a few variant overrides. Do
NOT replace it. No ADR change needed** (at most a one-line note on ADR-0006). The new direction
makes this an *easier* call than v0, because the Paper-Desktop look is **closer to shadcn's
defaults** than the brutalist v0 was.

### Why keep it (and why it's an even better fit now)

- shadcn/ui is **copy-paste, unstyled-by-default primitives** on Radix — you own the code; the
  styling is just Tailwind classes in *your* repo. No "fighting the framework."
- The new look needs **soft borders + 6px radius + no shadow** — which is much closer to
  shadcn's out-of-the-box card/button than v0's near-zero-radius hard-bordered brutalism.
  Reskinning is *less* work than before: set the tokens, remove shadows, done.
- It gives us the **hard parts for free**: accessibility (focus management, ARIA, keyboard nav
  on Dialog/Popover/Select) — directly serving our a11y + keyboard-on-desktop needs, including
  the window collapse/expand controls.
- It's the BudgetOnTarget stack (ADR-0006) — reuses owner expertise, fast, lean.

### How to reskin (concrete)

1. **Theme via CSS variables** — set §8 tokens as shadcn theme vars (`--background: canvas`,
   `--card: panel`, `--foreground: ink`, `--primary: rust`, `--border: line`, `--radius: 6px`).
   Moves ~70% of the look.
2. **Remove shadows, keep thin borders** — strip `shadow-*` from component templates; default
   `border` = 1px `line`. (shadcn files are local — edit `card.tsx`, `button.tsx` directly.)
3. **Build the Window component** — a small wrapper around shadcn `Card`: a `titlebar` slot
   (mono uppercase title + optional icon + optional collapse control) over a `Card` body. This
   is the one bespoke primitive that defines the whole language; everything else nests inside
   it. Make it a clean `cva`-variant component so every module reuses it.
4. **Soft-callout Badge/Alert variants** — add the pastel-tint `soft` badge/banner variants as
   `cva` variants (default status style now).
5. **Fonts** — wire §3 stacks; `font-sans` as the app default, `font-mono` on numbers, title
   bars, and code-like chips.
6. **Build the two domain showpieces yourself** (not shadcn primitives): the **Timeline/Gantt**
   (a CSS grid of cells inside a Window) and the **bed-layout planner**. shadcn covers
   Button/Input/Card/Dialog/Sheet/Tabs/Badge/Select/Table/Checkbox.

---

## 11. What changed from v0, and why (read this to see your feedback reflected)

Your feedback, in spirit: *"I like the terminal type style — but let's not go too hard in the
paint. Not directly terminal-inspired. More like PostHog's website — a Windows-XP-style: flat
and square, with paper colors — not a straight-up high-contrast terminal."* Here's exactly how
that landed:

| Your note | v0 (before) | v1 "Paper Desktop" (now) |
|---|---|---|
| **Not directly terminal** | Mono *everywhere*; the app "spoke" terminal. | **Sans is the default voice; mono is a data/chrome texture.** Title bars + numbers keep the software feel without the green-screen read. |
| **Windows-XP-style, windowed** | Dominant motif was a heavy black "ink panel header bar" (terminal output). | **Flat windows with soft title bars are now the centerpiece** (§1) — the single biggest visual shift. The app reads like a tidy old program, not a CLI. |
| **Flat and square (kept)** | Flat, square, no shadows — but very crunchy (1.5px black borders, ~2px radius). | **Still flat, no shadows** — but **thin 1px warm borders + 6px friendly radius**. Square-ish, not brutalist. |
| **Lower the contrast / severity** | Stark near-black ink, darker panels than canvas, heavy black header bars. | **Near-white windows on cream, warm charcoal (not near-black), hierarchy from weight not black bars.** Softened look — *but still ≥ AA everywhere* (gauged to PostHog's comfortable contrast). Not muddy. |
| **Paper colors (kept)** | Warm cream + earthy accents. | **Kept**, with the canvas slightly lighter and a new near-white `panel` for window bodies + soft pastel callout tints. |
| **Don't go too hard in the paint** | Pixel font, "slam" hero button, and heavy ASCII glyphs were *signatures*. | **All demoted to optional/minimal:** pixel font → wordmark-only (default off); slam button → at most one hero action; ASCII glyphs → sparing (Lucide icons are now default). |
| **Tabular/ledger numbers (kept)** | Tabular mono numbers, column alignment. | **Kept verbatim** — still the core data rhythm, now inside windows. |
| **NOT glossy XP/Aero** | (n/a) | Explicitly avoided — **flat, paper-colored, no gloss/bevel/gradient/glow.** We took XP's *squareness and windows*, not its candy. |
| **shadcn keep-and-reskin (kept)** | Keep + reskin. | **Confirmed, and now an easier fit** (closer to shadcn defaults). Plus a new bespoke `Window` wrapper component. |

Net: same warm-paper soul and the same honest ledger data discipline; the *clothing* changed
from "terminal printout" to "flat old desktop app."

---

## 12. Open questions for the owner (react here)

1. **Does the window/panel pattern (§1) land?** This is the centerpiece. Too much "old OS," just
   right, or should the title bars be even quieter? (We can make title bars more subtle — e.g.
   just a thin rule + label — if full title bars feel like too much chrome.)
2. **The name "Paper Desktop"** — keep it, or prefer "Homestead OS" / "Paper OS" / keep
   "Almanac" in the name somehow?
3. **Contrast level** — does §2 feel right (warm, comfortable, PostHog-ish), or still too
   stark / now too soft? This is the dial you reacted to; easy to nudge either way.
4. **Fonts** — OK with **IBM Plex Sans + IBM Plex Mono** (matched pair, free, PostHog's sans)?
   Or prefer Inter for the sans?
5. **Mono scope** — comfortable with mono limited to title bars + numbers + code-chips? Want a
   touch more mono (e.g. all labels) or even less?
6. **The optional flourishes** — any appetite to *keep* the pixel wordmark or the one "slam"
   hero button, or cut them entirely for a cleaner read?
7. **Soft pastel callout banners** vs hard-bordered colored boxes for info/warnings — prefer the
   gentler PostHog-style bands?
8. **Dark mode** — still agreed to defer to v1.1?

Once you react, I'll lock the direction, tune the soft-callout tints and the `Window` component
spec, and distill this into an ADR (`docs/decisions/0007-design-language-paper-desktop.md`) plus
a Frontend hand-off. (Not writing the ADR or committing anything yet — that waits on your
reaction, and you'll handle the branch/PR.)
