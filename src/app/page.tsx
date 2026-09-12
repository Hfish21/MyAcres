import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileJson,
  Leaf,
  LayoutGrid,
  Map,
  Sprout,
  WifiOff,
} from "lucide-react";

import { ThemeToggle } from "@/components/homestead/theme-toggle";

// The marketing landing at "/" — a chrome-free front door (no app shell, no
// homestead store). Explains what MyAcres is, who it's for, how the file-based
// workflow works, and the current Garden feature set. On-brand with Paper
// Desktop (ADR-0007): flat windows on warm paper, mono as chrome texture, the
// one saturated accent (rust). The app itself lives under /plan.

const FEATURES = [
  {
    view: "Plan",
    href: "/plan",
    icon: Sprout,
    blurb:
      "A visual, derived overview of the season: a garden timeline, what's coming up next, a harvest-coverage strip, and summary stats. Read-only — it reflects your data, it doesn't prescribe.",
  },
  {
    view: "Layout",
    href: "/layout",
    icon: LayoutGrid,
    blurb:
      "An interactive dot-grid canvas. Draw, arrange, and copy your growing spaces, see plantings as crop-colored density dots, and scrub a date across the season to watch beds fill and empty.",
  },
  {
    view: "Crops",
    href: "/crops",
    icon: Leaf,
    blurb:
      "Your crop library. Build produce-type profiles with the timing, spacing, light, and season details you actually use — the knowledge you bring to the garden, in one place.",
  },
  {
    view: "Spaces",
    href: "/spaces",
    icon: Map,
    blurb:
      "The list of your growing areas — beds, rows, containers, plots. Define them once and reuse them everywhere you plan and plant.",
  },
  {
    view: "Plantings",
    href: "/plantings",
    icon: CalendarDays,
    blurb:
      "A crop in a space on a date. MyAcres projects the schedule forward — germination, transplant, maturity, harvest — and checks how well it fits the space.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Open it",
    body: "No sign-up, no install. The app opens to an empty homestead, ready to use on your own machine.",
  },
  {
    n: "02",
    title: "Build your crop library",
    body: "Add the produce you grow, with your own timing and spacing. This is where your gardening knowledge lives.",
  },
  {
    n: "03",
    title: "Lay out your spaces",
    body: "Draw and arrange your beds on the grid, then record plantings — a crop, in a space, on a date.",
  },
  {
    n: "04",
    title: "Save your file",
    body: "Everything writes to a single .homestead file you own. Back it up, move it between devices, reopen it anytime.",
  },
];

const PRINCIPLES = [
  {
    icon: Sprout,
    title: "A tool, not an oracle",
    body: "MyAcres records and visualizes what you enter. It won't tell you when to plant or bundle a generic calendar — you bring the knowledge, it gives you the clarity.",
  },
  {
    icon: FileJson,
    title: "Your data, one file",
    body: "No database and no account. Your whole homestead lives in a portable .homestead file that you own, control, and can back up however you like.",
  },
  {
    icon: WifiOff,
    title: "Offline-first",
    body: "Open a URL and it just works — on your machine, with no server required. Install it as an app and it runs without a connection.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Header — echoes the app top bar, but with a clear way in. */}
      <header className="flex h-14 items-center gap-4 border-b border-line bg-titlebar px-4 sm:px-6">
        <span className="font-mono text-sm font-semibold tracking-wide text-ink uppercase">
          MyAcres
        </span>
        <span className="hidden font-mono text-xs tracking-wide text-ink-3 uppercase sm:inline">
          Homestead OS
        </span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/plan"
            className="inline-flex items-center gap-1.5 rounded-md bg-rust px-3 py-1.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Open MyAcres
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
          <p className="mb-4 font-mono text-xs tracking-wider text-rust uppercase">
            Offline-first · Garden module
          </p>
          <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
            Plan your garden. Feed your family, year-round.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
            MyAcres is a portable, offline-first app for running the homestead — a tool you grow
            over time, starting with the garden. It records and visualizes what you plant so you
            can be strategic about timing, space, and harvest.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-md bg-rust px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Open MyAcres
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:bg-inset"
            >
              See what it does
            </a>
          </div>
          <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-olive-ink" aria-hidden /> No account
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-olive-ink" aria-hidden /> No install
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-olive-ink" aria-hidden /> Your data stays yours
            </span>
          </p>
        </section>

        {/* What it's for */}
        <section className="border-y border-line bg-panel">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 sm:py-16">
            <div>
              <h2 className="font-mono text-xs tracking-wider text-ink-3 uppercase">
                What it&apos;s for
              </h2>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-balance">
                The record-keeping and visibility to grow food on purpose.
              </p>
            </div>
            <div className="space-y-4 text-ink-2">
              <p>
                A garden is easy to start and hard to keep track of. When did you plant that bed?
                What&apos;s ready in three weeks? Where are the gaps that leave you without fresh
                produce?
              </p>
              <p>
                MyAcres holds the plan — your crops, your spaces, your plantings — and turns it
                into a picture of the season, so timing and harvest become something you can see
                and steer, not just remember.
              </p>
            </div>
          </div>
        </section>

        {/* How to use it */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="font-mono text-xs tracking-wider text-ink-3 uppercase">How it works</h2>
          <p className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-balance">
            Four steps, and a file that&apos;s yours at the end.
          </p>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="bg-panel p-6">
                <span className="font-mono text-sm font-semibold text-rust">{step.n}</span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features — the five views, as windows on the desktop */}
        <section id="features" className="border-t border-line bg-panel scroll-mt-16">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <h2 className="font-mono text-xs tracking-wider text-ink-3 uppercase">
              The Garden module
            </h2>
            <p className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-balance">
              Five views over one plan.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                // Let the last odd card span both columns for a tidy grid.
                const wide = i === FEATURES.length - 1 && FEATURES.length % 2 === 1;
                return (
                  <Link
                    key={f.view}
                    href={f.href}
                    className={`group flex flex-col overflow-hidden rounded-md border border-line bg-canvas transition-colors hover:border-rust/50 ${
                      wide ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex h-10 items-center gap-2 border-b border-line bg-titlebar px-3">
                      <Icon className="size-4 shrink-0 text-ink-2" aria-hidden />
                      <span className="font-mono text-sm font-semibold tracking-wide text-ink-2 uppercase">
                        {f.view}
                      </span>
                      <ArrowRight
                        className="ml-auto size-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                    </div>
                    <p className="p-4 text-sm leading-relaxed text-ink-2 sm:p-5">{f.blurb}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="font-mono text-xs tracking-wider text-ink-3 uppercase">
            How it&apos;s built
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {PRINCIPLES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title}>
                  <div className="flex size-10 items-center justify-center rounded-md border border-line bg-panel">
                    <Icon className="size-5 text-rust" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-line bg-panel">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                Open it and start your season.
              </h2>
              <p className="mt-2 text-ink-2">
                It&apos;s ready the moment you click — nothing to sign up for.
              </p>
            </div>
            <Link
              href="/plan"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-rust px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Open MyAcres
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-8 sm:px-6">
          <span className="font-mono text-sm font-semibold tracking-wide text-ink uppercase">
            MyAcres
          </span>
          <span className="text-sm text-ink-3">
            Offline-first homestead management. Your data, your file, your machine.
          </span>
        </div>
      </footer>
    </div>
  );
}
