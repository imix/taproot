# Implementation: Concepts Section

## Behaviour
../usecase.md

## Design Decisions
- Placed immediately before `## Quick Start` (after the value proposition paragraph) — satisfies the spec's placement constraint and the welcoming-readme's ordering requirement
- Skip link (`[Quick Start ↓](#quick-start)`) added at the top of the section — allows experienced developers to bypass without scrolling back (AC-2)
- Each concept uses bold term + em-dash definition + indented Example line — scannable in ~10 seconds, matches the README's existing terse style
- `<details><summary>Further reading</summary>` block at the end of the section — satisfies AC-3 with one clearly labelled block mapping each concept to an existing verified docs page; avoids cluttering each definition with inline links
- Global truth example explicitly states "blocked before it merges" — conveys enforcement at commit time, not mere storage (AC-5)
- `password-reset` used as the example scenario throughout — already present in the directory tree block further down the README, consistent with the existing welcoming-readme implementation, universally recognisable (AC-4)
- No automated test — content artefact; ACs verified by human review (same pattern as welcoming-readme/content)
- All link targets verified to exist: `docs/concepts.md` ✓, `taproot/global-truths/` ✓, `docs/workflows.md` ✓

## Source Files
- `README.md` — Concepts section inserted before `## Quick Start`, satisfying AC-1 through AC-5

## Commits
- (run `taproot link-commits` to populate)
- `70cbe29a1310dd94e62096fc92b174e8d633c84c` — (auto-linked by taproot link-commits)
- `cc83e6289f2d31e937872bae8c357fd629c6aceb` — (auto-linked by taproot link-commits)
- `1c29d9582814334499e5965962fdb43d854a1582` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/concepts-section.test.ts`

## Status
- **State:** complete
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes a section of README.md (documentation only); no code design decisions; no architectural constraints apply | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — this behaviour has no NFR criteria; all acceptance criteria are functional and human-verifiable | resolved: 2026-03-26

## DoD Resolutions
- condition: document-current | note: README.md updated with a new Concepts section covering all five taproot terms (intent, behaviour, implementation, global truth, backlog) — each with a plain-language definition and a one-line example. All docs/ links in the section point to existing, accurate pages (docs/concepts.md, docs/workflows.md, taproot/global-truths/). No CLI commands, skills, or configuration options changed; no existing docs/ content became stale. | resolved: 2026-03-26T12:59:02.006Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — README content addition, not an architectural concern | resolved: 2026-03-28T16:22:12.943Z

- condition: check-if-affected: package.json | note: README content change — no new CLI commands or dependencies | resolved: 2026-03-28T16:22:12.686Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified; this implementation writes README.md only | resolved: 2026-03-26T13:00:35.458Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — inserting a vocabulary section into a README is a one-off documentation task; not a reusable pattern | resolved: 2026-03-26T13:00:34.102Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — adding a Concepts section to README.md is project-specific presentation; no cross-cutting enforcement concern for other implementations | resolved: 2026-03-26T13:00:32.786Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md (documentation only); no code design decisions; no architectural constraints apply | resolved: 2026-03-26T13:00:23.133Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill file modified; pattern-hints applies to skills that route user requests | resolved: 2026-03-26T13:00:21.273Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — README.md is a documentation file; no skill containing git commit steps was modified | resolved: 2026-03-26T13:00:19.846Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified; context-engineering constraints apply to skills/*.md only | resolved: 2026-03-26T13:00:18.529Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — modifies a single file (README.md); not a multi-document bulk-authoring skill flow | resolved: 2026-03-26T13:00:08.804Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — README.md is a static document; no agent skill output or What's next? interaction surface | resolved: 2026-03-26T13:00:07.066Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — implementation writes README.md (static documentation); no skill files, adapter files, or agent-specific language added | resolved: 2026-03-26T13:00:04.845Z

- condition: check-if-affected: examples/ | note: not affected — starter templates are hierarchy-only scaffolding; README.md presentation content is not part of example templates | resolved: 2026-03-26T12:59:57.943Z

- condition: check-if-affected: docs/ | note: not affected — no docs/ content modified; the Concepts section links to docs/concepts.md and docs/workflows.md (both existing and accurate); no new docs/ pages required | resolved: 2026-03-26T12:59:56.597Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md is the post-install onboarding walkthrough; the Concepts section serves pre-install readers and is a distinct surface | resolved: 2026-03-26T12:59:11.648Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts distributes skill and adapter files; README.md is not managed by update.ts | resolved: 2026-03-26T12:59:10.033Z

