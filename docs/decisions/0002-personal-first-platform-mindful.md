# ADR-0002: Personal-first, platform-mindful

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden

## Context

MyAcres is being built for the owner's personal homestead, but there's plausible future
upside as an open-source tool or paid SaaS. There's a real tension here: designing a grand
extensible "platform" up front is a classic over-engineering trap (months of speculative
abstraction for modules that may never exist), while building a throwaway personal hack
would make any future pivot painful.

The owner's explicit steer: aim for the personal tool, but build it in a way that *lends
itself* to a platform later — "not a hard requirement, more like a note to be mindful."

## Decision

We will build **personal-first**: optimize for shipping something useful to the owner,
cheaply and quickly, in the spirit of BudgetOnTarget. We will keep the **core/module seam
and the storage layer clean** so a future open-source/SaaS move is easy — but we will **not**
build speculative abstractions for modules that don't exist yet.

Concretely:

- Build the module contract to support the **one** module we have (Garden). Generalize the
  abstraction only when we have a real second module (rule-of-three).
- No plugin loader, dynamic module installation, per-module settings framework, or
  inter-module event bus in v1. Modules are statically imported into a registry array.
- Defer the monetization/open-source decision until the tool has proven useful over a real
  growing season. Keep spend near $0 until then.

## Consequences

- Fast path to a usable tool; minimal wasted effort on hypothetical futures.
- The codebase stays clean enough that extracting a real platform later is feasible.
- We accept that the first "module system" is really a convention for one module, and the
  true abstraction will be discovered when module #2 arrives — not guessed now.
- Requires ongoing discipline to resist building for imaginary modules.

## Alternatives considered

- **Full platform up front** — design a complete plugin/module framework before building any
  feature. Rejected: over-engineering; we'd get the abstraction wrong without a second real
  module to generalize from.
- **Pure personal hack** — ignore any future-platform considerations. Rejected: would bake in
  shortcuts (e.g. garden-specific assumptions in core) that make a future pivot costly, for
  little near-term savings.
