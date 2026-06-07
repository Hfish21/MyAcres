# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-06-06
- **Deciders:** Hayden

## Context

MyAcres is intended to grow over time, one feature and module at a time, across many work
sessions — some with Claude Code. A recurring problem in long-lived projects is lost
context: *why* was something built this way? Without a durable record, decisions get
silently re-litigated or accidentally undone, and onboarding (human or AI) is slow.

The owner specifically wants documentation of decisions and features to be a first-class
part of the repo from day one — "think ADRs" — as the mechanism for preserving how the
project was built out.

## Decision

We will keep **Architecture Decision Records** in `docs/decisions/`, one Markdown file per
significant decision, numbered sequentially. ADRs are append-only: to change a decision we
add a new ADR that supersedes the old one rather than editing history. Accepted ADRs are
binding — work should not contradict one without a superseding ADR.

We will also keep **feature specs** in `docs/features/` for detailed feature documentation.

## Consequences

- Every significant architectural or product decision has a durable, discoverable rationale.
- Future sessions (including Claude Code) can get up to speed by reading `docs/`.
- Small overhead per decision — worth it for a project meant to last and possibly become
  open-source/SaaS.
- The ADR index in `docs/decisions/README.md` must be kept current as ADRs are added.

## Alternatives considered

- **No formal records** — rely on commit messages and memory. Rejected: doesn't survive
  across sessions or contributors and was the explicit thing the owner wanted to avoid.
- **A single CHANGELOG/decisions file** — rejected: gets unwieldy and discourages writing
  decisions down; per-file ADRs are easier to reference and link.
