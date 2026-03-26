# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- **Inline injection, not a standalone sub-skill**: the truth-loading procedure is embedded directly into each affected authoring skill rather than extracted into a separate `/tr-apply-truths-when-authoring` command. Skills are designed to be self-contained — adding an inter-skill dependency would require every authoring skill to call another skill as a sub-routine, which no existing skill does. Inlining keeps skills readable and avoids a user-facing command that has no meaningful standalone use.
- **Four skills targeted, ineed.md excluded**: `/tr-intent`, `/tr-behaviour`, `/tr-implement`, and `/tr-refine` each draft or update a hierarchy document and are injected. `/tr-ineed` is a routing skill — it delegates to one of the four above, where truth-loading already happens. Injecting into the router too would cause double-loading.
- **Injection point per skill**: intent.md step 2a (after overlap check, before draft); behaviour.md step 1b (after pattern check, before sibling scan); implement.md step 3a (after parent intent read, before plan); refine.md step 2a (after classification, before draft changes). Each point is immediately before the first act of content authoring.
- **No TypeScript changes**: the entire implementation is prose modification of existing skill files. No new CLI commands, no SKILL_FILES entry — apply-truths-when-authoring is a cross-cutting pre-step woven into existing skills, not a new registerable command.

## Source Files
- `skills/intent.md` — added step 2a: load applicable truths before drafting an intent
- `skills/behaviour.md` — added step 1b: load applicable truths before specifying a use case
- `skills/implement.md` — added step 3a: load applicable truths before planning an implementation
- `skills/refine.md` — added step 2a: load applicable truths before drafting spec changes
- `.taproot/skills/intent.md` — synced copy
- `.taproot/skills/behaviour.md` — synced copy
- `.taproot/skills/implement.md` — synced copy
- `.taproot/skills/refine.md` — synced copy

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/apply-truths-when-authoring.test.ts` — covers AC-1 (intent-scoped truth applied in behaviour spec), AC-2 (scope filtering: impl-scoped not loaded at behaviour level), AC-3 (contradiction detection in all four skills), AC-4 (no-truths proceeds normally), AC-5 (unscoped file treated as intent-scoped with note)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed docs/architecture.md; this implementation modifies four skills/*.md prose files — no TypeScript changes, no new CLI commands, no SKILL_FILES registration. Adding a pre-draft step to existing skills is an additive prose change with no architectural decisions. Agent-agnostic output principle preserved (no agent-specific syntax added). No deviations. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — apply-truths-when-authoring/usecase.md contains no NFR-N entries in ## Acceptance Criteria. The behaviour has no performance, reliability, or accessibility thresholds. | resolved: 2026-03-26

## Status
- **State:** in-progress
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26
