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
- `ad707e76f9f2bf913733e58bb887aa535778c2d0` — (auto-linked by taproot link-commits)
- `a35c09b699dcfc0029728c61e4baad038bffb388` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/design-constraints.test.ts` — skill file exists; all four formats present with required fields; signal phrases present; completeness check step present; default file naming conventions present; spec link present

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — convention-only implementation; no source code architecture affected. Changes are to skill markdown files and docs/patterns.md. No architectural constraints from docs/architecture.md apply. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. This behaviour has no performance, security, or reliability thresholds. | resolved: 2026-03-29

## Status
- **State:** complete
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29

## DoD Resolutions
- condition: document-current | note: README.md does not enumerate individual skills — it links to docs/quick-start.md and skills/guide.md which are the canonical skill references. docs/patterns.md updated with design-constraints pattern entry. No CLI commands added. README and docs/ accurately reflect implemented features. | resolved: 2026-03-29T16:43:00.300Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — design-constraints.md introduces no shell commands, no credentials, no tokens. Agent reads patterns.md and writes truth files only. behaviour.md and ineed.md changes add one signal phrase line each. All changes follow least-privilege. | resolved: 2026-03-29T17:44:11.349Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: YES — already done. Design constraints session pattern added to docs/patterns.md with four format descriptions, signal phrases, and spec link. | resolved: 2026-03-29T17:44:11.079Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — adding a new skill and pattern signal is not a cross-cutting concern for settings.yaml. No new DoD gates required. | resolved: 2026-03-29T17:44:10.792Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — convention-only implementation. No architectural decisions made. docs/architecture.md constraints unaffected. | resolved: 2026-03-29T17:44:10.521Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: COMPLIANT — this implementation IS a pattern-hint enhancement. Signal phrases added to skills/behaviour.md and skills/ineed.md. Design constraints pattern entry added to docs/patterns.md with signal phrases. Follows existing pattern-check format exactly. | resolved: 2026-03-29T17:44:10.221Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — design-constraints.md does not instruct the agent to run git commit. It writes truth files only. Committing is delegated to /tr-commit in the What's next? block. | resolved: 2026-03-29T17:43:54.894Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — C-1: Description is under 50 tokens. C-2: No embedded reference docs. C-3: No cross-skill repetition. C-4: No bulk pre-load; files read only when needed (truth file read at step 6 before writing). C-5: Session hygiene signal present before What's next? block. | resolved: 2026-03-29T17:43:54.616Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — skill confirms format classification before proceeding ('That sounds like a [format] — is that right?') and presents the format choice as an explicit developer decision at step 1. No bulk writes without developer input. | resolved: 2026-03-29T17:43:54.346Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — skills/design-constraints.md includes a What's next? block with three options: /tr-define-truth, /tr-discover-truths, /tr-commit. Follows the lettered menu format. | resolved: 2026-03-29T17:43:54.027Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — skills/design-constraints.md uses generic language throughout: 'the agent', 'the developer'. No Claude-specific names, no @{project-root} syntax, no agent-specific invocation mechanisms. | resolved: 2026-03-29T17:43:53.756Z

- condition: check-if-affected: examples/ | note: No examples exercise the design-constraints skill directly. Not applicable. | resolved: 2026-03-29T16:43:09.572Z

- condition: check-if-affected: docs/ | note: AFFECTED and UPDATED — docs/patterns.md updated with Design constraints session pattern entry including all four formats, signal phrases, and spec link. | resolved: 2026-03-29T16:43:09.301Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED and UPDATED — added /tr-design-constraints entry to the skill reference table in skills/guide.md. | resolved: 2026-03-29T16:43:09.034Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts imports SKILL_FILES from init.ts. design-constraints.md added to SKILL_FILES in init.ts — update.ts automatically copies it on next taproot update run. No direct change to update.ts needed. | resolved: 2026-03-29T16:43:08.762Z

- condition: check-if-affected: package.json | note: No new dependencies or version bump required. Skill-only change — no source code packages added. | resolved: 2026-03-29T16:43:08.492Z

