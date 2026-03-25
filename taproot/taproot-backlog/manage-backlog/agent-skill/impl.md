# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure skill-file implementation — no TypeScript/CLI changes beyond adding to `SKILL_FILES`. All logic (detect arg, read/write file, triage loop) is conversational.
- `backlog.md` added to `SKILL_FILES` in `src/commands/init.ts` so it installs via `taproot init` and refreshes via `taproot update`.
- `taproot update` used to sync both `.taproot/skills/backlog.md` and `.claude/commands/tr-backlog.md` — cleaner than manual copy.
- Non-standard lines in `.taproot/backlog.md` are preserved and skipped silently during triage, with a count reported after — avoids data loss for hand-edited content.
- Blank/whitespace argument detected early with a one-line warning — no silent no-ops.

## Source Files
- `skills/backlog.md` — new skill file implementing all 7 ACs; two modes: capture (arg present) and triage (no arg)
- `.taproot/skills/backlog.md` — synced via `taproot update`
- `src/commands/init.ts` — added `'backlog.md'` to `SKILL_FILES`
- `skills/guide.md` — added `/tr-backlog` to the slash commands reference table
- `.taproot/skills/guide.md` — synced via `taproot update`

## Commits
<!-- taproot-managed -->

## Tests
- `test/unit/skills.test.ts` — AC-1: capture confirms with no follow-up; AC-2: D/K/P options present; AC-5: promote delegates to /tr-ineed; AC-6: empty backlog message; AC-7: triage completion summary format

## Status
- **State:** in-progress
- **Created:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance governs TypeScript CLI source code; this implementation modifies only skill files and the SKILL_FILES array constant | resolved: 2026-03-25T13:35:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR entries in usecase.md; backlog capture has no performance targets | resolved: 2026-03-25T13:35:00.000Z
