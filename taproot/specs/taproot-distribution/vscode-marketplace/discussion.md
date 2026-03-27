# Discussion: Publish VS Code Extension

**Skill:** tr-behaviour
**Date:** 2026-03-26

## Pivotal Questions

**What is the VS Code extension actually for?**
The initial backlog item listed "in-editor linting, spec navigation, status indicators, integrated slash commands" — implying a rich developer tool. Discovery revealed the real driver is marketing reach: the maintainer wants taproot to appear alongside peers like bmad, speckit, and openspec. The extension is a distribution channel, not a workflow tool.

**Should the extension do anything once installed, or be a pure listing?**
A pure listing (no commands) is unusual in the VS Code Marketplace and would feel empty to an installer. A single Command Palette entry ("Taproot: Initialize project") and a Get Started walkthrough are the VS Code-native minimum — discoverable, functional, not over-engineered.

## Alternatives Considered

- **Rich in-editor UI** (tree view, inline linting, status bar) — deferred; premature before taproot has traction. Would require significant ongoing maintenance.
- **JetBrains plugin simultaneously** — deferred; requires Kotlin, slower review cycle, lower ROI vs VS Code at this stage.
- **Separate publish procedure** — considered making VS Code publish a standalone skill invocation. Rejected: integrating with the existing `cut-release` CI flow keeps the release atomic and avoids a second manual step.

## Decision

Minimal extension: Marketplace listing + one Command Palette entry + Get Started walkthrough. Published as an additional CI step in the existing `cut-release` flow. Open VSX published in parallel as a non-blocking step (VSCodium/Gitpod coverage).

## Open Questions

- Publisher name / VS Code Marketplace publisher ID not yet decided — needs to be chosen before first publish (affects the extension's permanent URL).
- Should the extension's `package.json` version be bumped as part of `cut-release` automatically, or maintained manually?
- Long-term: as taproot gains traction, the extension could grow into a richer tool — the architecture (shell-out to CLI) supports that without a rewrite.
