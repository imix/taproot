# Implementation: Agent Skill — skills/commit.md + CLAUDE.md

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a pure agent skill (skills/commit.md) — no CLI code needed. The skill is a markdown procedure file that agents read and execute.
- CLAUDE.md `## Before committing` section replaced with a single `/tr-commit` trigger. The detailed procedure now lives in the skill, not in CLAUDE.md, to avoid duplication and ensure both human-says-commit and agent-about-to-commit paths use the same spec.
- `commit.md` added to `SKILL_FILES` in `src/commands/init.ts` so it is installed by `taproot init` and copied by `taproot update`.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) maintained in sync per CLAUDE.md policy.
- Tests are content-proxy tests in `test/unit/skills.test.ts` — verify key phrases (one-at-a-time resolution, [A]/[B]/[C] mass commit, DoR resolution format, requirement commit quality checks) are present in the skill markdown.

## Source Files
- `skills/commit.md` — the callable `/tr-commit` skill: classification, sub-flows for all four commit types, DoD/DoR resolution loop, mass commit handling
- `.taproot/skills/commit.md` — installed copy (kept in sync with skills/commit.md)
- `src/commands/init.ts` — added `'commit.md'` to SKILL_FILES
- `CLAUDE.md` — replaced `## Before committing` manual scan with `/tr-commit` trigger

## Commits
- placeholder

## Tests
- `test/unit/skills.test.ts` — AC-1: one-condition-per-invocation; AC-2: conversational trigger; AC-4: declaration parent state check; AC-5: plain commit no gate; AC-7: mass commit [A]/[B]/[C]; requirement commit quality checks; declaration DoR without CLI

## Status
- **State:** in-progress
- **Created:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: agent skill only — no CLI source code added. No architectural decisions in docs/architecture.md apply to markdown skill files. Not applicable. | resolved: 2026-03-21
