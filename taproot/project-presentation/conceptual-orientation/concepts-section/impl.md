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

## Tests
- (no automated test — content artefact; ACs verified by human review)

## Status
- **State:** in-progress
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes a section of README.md (documentation only); no code design decisions; no architectural constraints apply | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — this behaviour has no NFR criteria; all acceptance criteria are functional and human-verifiable | resolved: 2026-03-26
