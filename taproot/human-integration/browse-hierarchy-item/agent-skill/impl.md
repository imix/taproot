# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure skill-file implementation — no TypeScript/CLI changes. The behaviour is entirely agent-driven: the agent follows the skill instructions.
- `browse.md` added to `SKILL_FILES` in `src/commands/init.ts` so it is installed by `taproot init` and refreshed by `taproot update`.
- Discussion context shown at a single anchor per browse session (not repeated per section) — reduces noise while still surfacing the rationale at the most relevant point.
- Long-section pagination threshold of ~20 lines is a guideline in the skill notes rather than a hard rule — gives the agent judgment to handle edge cases (e.g. 22 very short lines vs 15 very long lines).
- `[S] Skip to children` included from the start (per refined spec, AC-1) — lets the developer jump straight to the children list when they've already read the spec.
- Taproot-managed section warning (`## Commits`, `## DoD Resolutions`) prevents accidental corruption of machine-managed sections without blocking the developer if they knowingly want to edit.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) updated per CLAUDE.md sync policy.

## Source Files
- `skills/browse.md` — new skill file implementing all 8 ACs; six steps covering path resolution, discussion.md detection, section presentation, [C]/[M]/[S] interaction, pagination, and children listing
- `.taproot/skills/browse.md` — synced from skills/
- `src/commands/init.ts` — added `'browse.md'` to `SKILL_FILES`

## Commits
<!-- taproot-managed -->

## Tests
- `test/unit/skills.test.ts` — AC-1: [C]/[M]/[S] options present; AC-3: children listing and leaf message; AC-4/AC-7: discussion.md anchors; AC-5: path error messages; AC-8: change-of-mind handling

## Status
- **State:** in-progress
- **Created:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance governs TypeScript CLI source code; this implementation modifies only skill files and SKILL_FILES array | resolved: 2026-03-25T13:05:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR entries in usecase.md; browse has no performance targets | resolved: 2026-03-25T13:05:00.000Z
