# Architecture Decision Records (ADRs)

This directory is the project's memory for **why** things are the way they are. Each ADR
captures one significant decision: the context, the choice, and the consequences.

## Why we keep these

Context evaporates between sessions (human and AI). An ADR lets anyone — including a future
Claude Code session — understand the reasoning behind a decision without re-deriving it or
accidentally undoing it. **Accepted ADRs are binding.** Don't contradict one silently;
instead, write a new ADR that supersedes it.

## Conventions

- One decision per file, numbered sequentially: `NNNN-short-title.md`.
- Copy [`adr-template.md`](adr-template.md) to start a new one.
- ADRs are **append-only history**. To change a decision, add a new ADR and mark the old one
  `Superseded by ADR-XXXX`. Don't rewrite history.
- Statuses: `Proposed` · `Accepted` · `Superseded` · `Deprecated`.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-personal-first-platform-mindful.md) | Personal-first, platform-mindful | Accepted |
| [0003](0003-file-first-storage-no-database.md) | File-first storage, no database | Accepted |
| [0004](0004-tool-not-oracle.md) | The app is a tool, not an oracle | Accepted |
| [0005](0005-core-module-architecture.md) | Shell + module architecture | Accepted |
| [0006](0006-tech-stack-pwa.md) | Static PWA tech stack | Accepted |
| [0007](0007-design-language-paper-desktop.md) | Design language — "Paper Desktop" | Accepted |
| [0008](0008-homestead-file-schema.md) | The `.homestead` file schema | Accepted |
