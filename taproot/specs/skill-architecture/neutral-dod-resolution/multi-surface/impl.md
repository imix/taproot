# Implementation: Multi-Surface — Settings Gate + Skill Declarations

## Behaviour
../usecase.md

## Design Decisions
- Constraint activated via `check-if-affected-by: skill-architecture/neutral-dod-resolution` in settings.yaml, scoped to `skills/*.md` — only fires when a skill file is staged
- `[invoke: compress-context]` added immediately before DoD resolution in both `commit.md` (Implementation commit step 2) and `implement.md` (step 8) — the only two skills that run `taproot dod --resolve` on behalf of the developer

## Source Files
- `taproot/settings.yaml` — adds `check-if-affected-by: skill-architecture/neutral-dod-resolution` with `when: source-matches: "skills/*.md"` scope
- `skills/commit.md` — `[invoke: compress-context]` added before step 2 of Implementation commit sub-flow
- `skills/implement.md` — `[invoke: compress-context]` added before step 8
- `taproot/agent/skills/commit.md` — mirror of skills/commit.md
- `taproot/agent/skills/implement.md` — mirror of skills/implement.md

## Commits
- (run `taproot link-commits` to populate)

## Tests
- No automated tests — constraint is agent-verifiable at DoD time via `check-if-affected-by`; presence of `[invoke: compress-context]` in commit.md and implement.md is directly observable

## Status
- **State:** in-progress
- **Created:** 2026-04-13
- **Last verified:** 2026-04-13

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — no new interfaces or exported functions; changes are skill file text additions and a settings.yaml entry. | resolved: 2026-04-13
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: COMPLIANT — AC-1 and AC-3 are directly verifiable by reading the skill files; AC-2 is verified by the check-if-affected-by gate at DoD time. | resolved: 2026-04-13
- condition: check: does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md? | note: NO — no new interfaces. | resolved: 2026-04-13
- condition: check: does an existing abstraction already cover this? See arch-code-reuse_behaviour.md | note: NO — the capability declaration is a textual addition to skill files; no code abstraction applicable. | resolved: 2026-04-13
