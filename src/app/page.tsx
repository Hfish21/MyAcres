import {
  Sprout,
  Droplets,
  Scissors,
  ClipboardList,
  Carrot,
  Palette,
  Info,
  Check,
} from "lucide-react";

import { Window } from "@/components/ui/window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Phase 0 showcase — a STATIC "design-system preview" of the Paper Desktop
// language (ADR-0007). No storage, no real data, no modules. It exists so the
// look can be seen and reacted to; it is a stand-in for the real shell (Phase 2).

const tasks = [
  {
    icon: Sprout,
    label: "Transplant tomatoes",
    bed: "N-2",
    status: "overdue" as const,
    statusLabel: "Overdue",
  },
  {
    icon: Droplets,
    label: "Water seedlings",
    bed: "Greenhouse",
    status: "today" as const,
    statusLabel: "Today",
  },
];

const harvest = [
  { label: "Lettuce", bed: "N-1" },
  { label: "Beans", bed: "E-3" },
];

const growing = [
  { label: "Tomatoes", dtm: 68, stage: 3 },
  { label: "Peppers", dtm: 75, stage: 2 },
  { label: "Squash", dtm: 50, stage: 4 },
];

const accents = [
  { name: "rust", className: "bg-rust" },
  { name: "olive", className: "bg-olive" },
  { name: "amber", className: "bg-amber" },
  { name: "ochre", className: "bg-ochre" },
  { name: "barn", className: "bg-barn" },
  { name: "inkblue", className: "bg-inkblue" },
];

const surfaces = [
  { name: "canvas", className: "bg-canvas" },
  { name: "panel", className: "bg-panel" },
  { name: "titlebar", className: "bg-titlebar" },
  { name: "inset", className: "bg-inset" },
];

function StageBar({ filled }: { filled: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < filled ? "h-2.5 w-2 bg-olive" : "h-2.5 w-2 bg-inset"}
        />
      ))}
    </span>
  );
}

function BedChip({ bed }: { bed: string }) {
  return (
    <span className="font-mono text-xs text-ink-3">
      bed <span className="text-ink-2">{bed}</span>
    </span>
  );
}

export default function ShowcasePage() {
  return (
    <div className="min-h-dvh bg-canvas">
      {/* Top context bar (visual only — previews the §5.5 shell top bar). */}
      <div className="flex h-12 items-center justify-between border-b border-line bg-canvas px-4">
        <div className="flex items-center gap-1.5 text-sm text-ink-2">
          <span className="font-semibold text-ink">MyAcres</span>
          <span className="text-ink-3">/</span>
          <span>Garden</span>
          <span className="text-ink-3">›</span>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-3">
          <span className="size-2 rounded-full bg-olive" aria-hidden />
          saved
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-ink">Paper Desktop</h1>
          <p className="text-sm text-ink-3">
            A static preview of the MyAcres design language — flat windows on warm
            paper, sans to read, mono for data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* TASKS DUE */}
          <Window title="Tasks Due" icon={<ClipboardList />}>
            <ul className="flex flex-col gap-3">
              {tasks.map((t, i) => (
                <li key={t.label}>
                  <div className="flex items-start gap-3">
                    <t.icon className="mt-0.5 size-4 shrink-0 text-ink-2" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-ink">{t.label}</span>
                        <Badge variant={t.status}>{t.statusLabel}</Badge>
                      </div>
                      <BedChip bed={t.bed} />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button variant="secondary" size="sm">
                      <Check className="size-4" /> Done
                    </Button>
                  </div>
                  {i < tasks.length - 1 ? <Separator className="mt-3" /> : null}
                </li>
              ))}
            </ul>
          </Window>

          {/* READY TO HARVEST */}
          <Window title="Ready to Harvest" icon={<Carrot />}>
            <ul className="flex flex-col gap-2">
              {harvest.map((h) => (
                <li key={h.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-ink">{h.label}</span>
                    <BedChip bed={h.bed} />
                  </span>
                  <Badge variant="ready">Ready</Badge>
                </li>
              ))}
            </ul>
          </Window>

          {/* GROWING NOW */}
          <Window title="Growing Now" icon={<Sprout />} count={growing.length}>
            <ul className="flex flex-col gap-2.5">
              {growing.map((g) => (
                <li key={g.label} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-ink">{g.label}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs tabular-nums text-ink-3">
                      DTM <span className="text-ink-2">{g.dtm}</span>
                    </span>
                    <StageBar filled={g.stage} />
                    <Badge variant="growing">Growing</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </Window>

          {/* Form preview */}
          <Window title="Quick Add" icon={<Scissors />}>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-3">
                Buttons and inputs in the Paper Desktop style.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete</Button>
              </div>
            </div>
          </Window>

          {/* DESIGN TOKENS — full width */}
          <Window title="Design Tokens" icon={<Palette />} className="sm:col-span-2">
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-3">
                  Accents
                </p>
                <div className="flex flex-wrap gap-3">
                  {accents.map((a) => (
                    <div key={a.name} className="flex flex-col items-center gap-1">
                      <span
                        className={`size-10 rounded-md border border-line ${a.className}`}
                      />
                      <span className="font-mono text-xs text-ink-3">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-3">
                  Surfaces
                </p>
                <div className="flex flex-wrap gap-3">
                  {surfaces.map((s) => (
                    <div key={s.name} className="flex flex-col items-center gap-1">
                      <span
                        className={`size-10 rounded-md border border-line ${s.className}`}
                      />
                      <span className="font-mono text-xs text-ink-3">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-3">
                  Type scale
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-[28px] font-bold leading-tight text-ink">
                    Display — feed the family
                  </p>
                  <p className="text-[22px] font-bold text-ink">Heading — Garden, Today</p>
                  <p className="text-base text-ink">
                    Body — the app reads in a humanist sans for comfort.
                  </p>
                  <p className="font-mono text-base tabular-nums text-ink-2">
                    Numbers — DTM 68 · 12 lbs · bed N-2
                  </p>
                  <p className="font-mono text-sm font-semibold uppercase tracking-wide text-ink-2">
                    Title bar — growing now
                  </p>
                </div>
              </div>
            </div>
          </Window>

          {/* Collapsible demo — full width */}
          <Window
            title="About This Preview"
            icon={<Info />}
            collapsible
            className="sm:col-span-2"
          >
            <p className="max-w-prose text-sm text-ink">
              This screen is a static design-system preview, not the real app — there
              is no data engine yet. It exists so the Paper Desktop look can be seen
              and tuned. The title bar above has a real collapse control (try it); per
              the design language, we never ship controls that do nothing.
            </p>
          </Window>
        </div>
      </main>
    </div>
  );
}
