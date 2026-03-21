# Implementation: README Content

## Behaviour
../usecase.md

## Design Decisions
- Pain point hook opens the README — the first sentence names the problem (AI coding loses *why* context) before naming the solution; this matches GSD's problem-first opening pattern
- Value proposition in the second sentence, not the fourth — visitor should understand what taproot is before reading any code tree or feature list
- Design principles as three short philosophy bullets (inspired by OpenSpec's declarative values) — positioned before Quick Start so the visitor understands the approach, not just the tool
- Agent tier table in Quick Start — `taproot init --agent` is where tier matters; the table is inline rather than a separate section to reduce friction
- "Taproot tracks itself" section uses the live OVERVIEW.md counts as a trust signal — demonstrates production use on its own codebase; counts are static (not auto-generated) but accurate at time of writing and covered by `document-current` DoD condition
- No automated test — content is verified by human review and GitHub rendering; AC-1 through AC-5 are the acceptance criteria for any future content update; NFR-1 (no broken Markdown) is verified by GitHub rendering on push

## Source Files
- `README.md` — project landing page rewrite satisfying all 5 ACs and NFR-1

## Commits
<!-- taproot-managed -->
- `8a5de155a441ac8d76ca4b2676a766e3c703b498` — (auto-linked by taproot link-commits)
- `fa57208f439f49117e3cfc07a7fbe7b10c807e85` — (auto-linked by taproot link-commits)

## Tests
- (no automated test — content artefact; ACs verified by human review; NFR-1 verified by GitHub rendering)

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md (a documentation file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — NFR-1 in usecase.md requires "all Markdown elements render correctly with no raw syntax visible" — testable boolean condition; threshold is specific and measurable | resolved: 2026-03-21

## DoD Resolutions
- condition: document-current | note: README.md IS the document being updated — this story is the README rewrite; all CLI commands, skills, and config options in the new README are accurate at time of writing | resolved: 2026-03-21T17:12:30.553Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — README rewrite is a project-specific presentation task; not a reusable implementation pattern | resolved: 2026-03-21T17:12:32.867Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — README rewrite is a one-time content update; it introduces no cross-cutting enforcement concern | resolved: 2026-03-21T17:12:32.637Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md (a documentation file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21T17:12:32.398Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill or agent interaction surface added | resolved: 2026-03-21T17:12:32.168Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — README.md is a documentation file; no skill containing git commit steps was added or modified | resolved: 2026-03-21T17:12:31.931Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill file added or modified | resolved: 2026-03-21T17:12:31.704Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — implementation writes a single file (README.md); not a multi-document skill flow requiring developer confirmation | resolved: 2026-03-21T17:12:31.475Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — implementation writes README.md (a static doc); no agent-facing output and no What's next? interaction surface | resolved: 2026-03-21T17:12:31.248Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers skill commands; README positioning and onboarding copy is a separate concern | resolved: 2026-03-21T17:12:31.019Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts propagates skill/adapter files; it does not manage README.md | resolved: 2026-03-21T17:12:30.785Z

