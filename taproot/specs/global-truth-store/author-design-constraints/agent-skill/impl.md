# Implementation: Agent Skill — design constraints session

## Behaviour
../usecase.md

## Design Decisions
- Convention-only implementation — no new CLI commands or data structures. The behaviour is surfaced through a new skill file (`design-constraints.md`) that agents load on demand, plus signal phrases in `behaviour.md` and `ineed.md`.
- All four constraint formats (Decision, Principle, Rule, External) are implemented inline in a single skill file, following the `define-truth.md` precedent. No sub-skill files per format — this keeps the skill discoverable as one command and avoids forcing developers to know which sub-skill to invoke.
- The skill appends to existing truth files rather than replacing them, matching the `define-truth.md` convention. The agent reads the file before writing to check for contradictions (AC-7/AC-8 in parent spec).
- Default truth file names per format: Decisions → `architecture_impl.md` (or named by domain); Principles → `principles_intent.md`; Conventions → `conventions_impl.md`; External → `external-constraints_intent.md`. These are suggested defaults — the developer may choose any name.
- The `ineed.md` global-truth check already routes to `/tr-define-truth`. A new routing branch is added for "structured design constraint" signals — when the description sounds like wanting to define architecture or design principles upfront.
- Signal phrases added to `behaviour.md` pattern-check so agents surface this skill when a developer mentions defining architecture, UX guidelines, or project constraints during spec authoring.

## Source Files
- `skills/design-constraints.md` — new skill implementing the full session: format selection, 4 format sub-flows, append logic, completeness check
- `taproot/agent/skills/design-constraints.md` — installed copy (must match skills/ source exactly)
- `docs/patterns.md` — added "Design constraints" pattern entry with signal phrases and format descriptions
- `skills/behaviour.md` — added signal phrase to pattern-check step for architecture/UX/constraints
- `taproot/agent/skills/behaviour.md` — installed copy updated
- `skills/ineed.md` — added routing branch for structured constraint capture
- `taproot/agent/skills/ineed.md` — installed copy updated
- `src/commands/init.ts` — added `design-constraints.md` to `SKILL_FILES`
- `skills/guide.md` — added `/tr-design-constraints` entry

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/design-constraints.test.ts` — skill file exists; all four formats present with required fields; signal phrases present; completeness check step present; default file naming conventions present; spec link present

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — convention-only implementation; no source code architecture affected. Changes are to skill markdown files and docs/patterns.md. No architectural constraints from docs/architecture.md apply. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. This behaviour has no performance, security, or reliability thresholds. | resolved: 2026-03-29

## Status
- **State:** in-progress
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29
