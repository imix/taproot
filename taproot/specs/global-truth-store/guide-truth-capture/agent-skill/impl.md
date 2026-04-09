# Implementation: Guide Truth Capture — Agent Skill

## Behaviour

../usecase.md

## What Was Built

Added the global-truths pattern entry to `taproot/agent/docs/patterns.md` (and synced to `docs/patterns.md`) and updated the `define-truth` skill to proactively surface truth-type guidance on first invocation in a project with no existing truth files.

## Design Decisions

- Phase 0 in `define-truth` runs only when `taproot/global-truths/` has no `.md` files — subsequent invocations skip it entirely
- Pattern entry lives in `docs/patterns.md` (public) and `taproot/agent/docs/patterns.md` (agent-readable) — same file, synced manually
- Five categories (glossary, domain model, architecture decisions, naming conventions, business rules) are presented as starting points, not an exhaustive list
- Phase 0 is skippable — developer can press Enter to bypass and define a truth directly

## Source Files

- `taproot/agent/skills/define-truth.md`
- `skills/define-truth.md`
- `taproot/agent/docs/patterns.md`
- `docs/patterns.md`

## Tests

No automated tests — skill file and pattern entry are agent-readable markdown. AC coverage verified by manual review of `skills/define-truth.md` Phase 0 logic and `docs/patterns.md` global-truths section.

## DoR Resolutions

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: skill change, no new architectural patterns introduced | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new measurable behaviour introduced | resolved: 2026-03-28

## DoD Resolutions
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No new cross-cutting concern. This adds a phase to define-truth for first-time use — it is not an architectural rule that should gate all implementations. | resolved: 2026-03-28T15:55:30.616Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: skills/define-truth.md updated. Phase 0 only reads directory listings and a markdown file. No shell execution, no credentials, no elevated permissions. | resolved: 2026-03-28T15:55:36.640Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: Yes — the global-truths pattern entry added to docs/patterns.md is itself the reusable output of this story. | resolved: 2026-03-28T15:55:36.377Z


- condition: tests-passing | note: no testable source files changed; skill is agent-readable markdown | resolved: 2026-03-28
- condition: document-current | note: docs/patterns.md is the primary output — added global-truths section. docs/workflows.md not affected. README not affected. | resolved: 2026-03-28
- condition: check-if-affected: package.json | note: no new CLI commands or dependencies | resolved: 2026-03-28
- condition: check-if-affected: src/commands/update.ts | note: no change to update command | resolved: 2026-03-28
- condition: check-if-affected: skills/guide.md | note: guide.md does not cover define-truth skill internals | resolved: 2026-03-28
- condition: check-if-affected: docs/ | note: docs/patterns.md updated with global-truths section | resolved: 2026-03-28
- condition: check-if-affected: examples/ | note: no examples affected | resolved: 2026-03-28
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — skill file uses agent-neutral language throughout | resolved: 2026-03-28
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: define-truth already has a What's next? block; Phase 0 does not remove it | resolved: 2026-03-28
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Phase 0 pauses before creating category files — developer confirms which categories apply | resolved: 2026-03-28
- condition: check-if-affected-by: skill-architecture/context-engineering | note: Phase 0 is conditional and short; no context bloat introduced | resolved: 2026-03-28
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — define-truth does not commit | resolved: 2026-03-28
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — this is a skill change, not a consumer impl | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — skill change only | resolved: 2026-03-28
- condition: check: cross-cutting concern | note: no new cross-cutting condition needed | resolved: 2026-03-28
- condition: check: reusable pattern | note: the global-truths section added to docs/patterns.md is itself the pattern output | resolved: 2026-03-28
- condition: check: security | note: skill change; no shell execution, no credentials, no elevated permissions | resolved: 2026-03-28
- condition: check-if-affected-by: taproot-distribution/vscode-marketplace | note: not applicable — no channels/** files changed | resolved: 2026-03-28

## Commits

<!-- populated by taproot link-commits -->
- `ecd26ce3d0247954c90e1d63eaf8b1b15f3ca6d0` — (auto-linked by taproot link-commits)
- `e99f4f032efc365080605bf4661e0db7fdec92e1` — (auto-linked by taproot link-commits)

## Status

- **State:** complete
- **Created:** 2026-03-28
- **Last verified:** 2026-04-09
