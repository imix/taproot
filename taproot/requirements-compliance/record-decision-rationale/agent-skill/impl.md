# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure skill-file implementation — no TypeScript/CLI changes. The behaviour is entirely agent-driven: the agent follows the skill instructions.
- Step 5b inserted in `implement.md` between step 5a (update usecase.md Implementations section) and step 6 (declaration commit), so `discussion.md` is staged with `impl.md` in the same commit.
- Step 9b inserted in `behaviour.md` after step 9 (write usecase.md) as an explicit optional — not step 9a to avoid renumbering the existing 9b (which doesn't exist, but to leave room).
- Template documented inline in the skill (four sections: Pivotal Questions, Alternatives Considered, Decision, Open Questions) — no separate template file needed; agents read the skill and reproduce it.
- "When to skip" guidance explicitly documented in `implement.md` to address AC-3 — a skill that always writes the file would produce low-quality noise for trivial commits.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) updated per CLAUDE.md sync policy.

## Source Files
- `skills/implement.md` — added step 5b: write `discussion.md` with four-section template and skip guidance; updated step 6 header to mention `discussion.md`
- `skills/behaviour.md` — added step 9b: optional `discussion.md` for substantive spec-authoring sessions
- `.taproot/skills/implement.md` — synced from skills/
- `.taproot/skills/behaviour.md` — synced from skills/

## Commits
<!-- taproot-managed -->

## Tests
- `test/unit/skills.test.ts` — AC-1: implement.md contains discussion.md step before declaration commit, covers all four sections, stages with impl.md; AC-2: behaviour.md has optional discussion.md step referencing the same template; AC-3: trivial session skip guidance documented

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — skill file authoring; architecture-compliance governs CLI source code, not skill files | resolved: 2026-03-25T12:10:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no performance-sensitive code paths; skill file edit only | resolved: 2026-03-25T12:10:00.000Z

## Status
- **State:** in-progress
- **Created:** 2026-03-25
