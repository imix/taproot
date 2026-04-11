# Implementation: Agent Skill — UX Module

## Behaviour
../usecase.md

## Design Decisions
- All 10 skills (orchestrator + 9 aspect sub-skills) are implemented in a single impl record. Sub-skills are co-required by the orchestrator and have no independent value before it exists; keeping them together avoids orphaned skill files with no coverage.
- Skills are distributed via `SKILL_FILES` in `src/commands/init.ts` and `taproot update` — consistent with every existing skill. Projects that don't use UX features are not burdened: no DoD conditions run unless the project explicitly wires `check-if-affected-by: taproot-modules/user-experience` in their settings.yaml.
- Skill naming: `ux-define` (orchestrator) + `ux-<aspect>` (sub-skills). Module-prefix `ux-` is unambiguous and doesn't collide with any existing skill names.
- No new CLI TypeScript commands added — the module is pure agent skill markdown files. This satisfies the intent constraint "module conventions must be expressible without modifying core taproot source".
- Sub-skills write global truth files using free-form markdown (same format as `/tr-define-truth` output). They do not call `/tr-define-truth` — they write directly to avoid a double-prompt loop when invoked from the orchestrator.
- DoD wiring is written to the project's `taproot/settings.yaml` (or `taproot/settings.yaml`) under `definitionOfDone`, not to taproot's own settings — the condition only runs in projects that activate the module.

## Source Files
- `skills/ux-define.md` — orchestrator skill (`/tr-ux-define`): scans coverage across 9 aspects, presents status, routes to sub-skills in sequence, offers DoD wiring at the end
- `skills/ux-orientation.md` — orientation sub-skill: elicits context-discovery, empty-state, and onboarding conventions; writes `ux-orientation_behaviour.md`
- `skills/ux-flow.md` — flow sub-skill: elicits navigation, cancellation, multi-step, and destructive-action conventions; writes `ux-flow_behaviour.md`
- `skills/ux-feedback.md` — feedback sub-skill: elicits success/error/warning hierarchy, loading states, and partial-outcome conventions; writes `ux-feedback_behaviour.md`
- `skills/ux-input.md` — input sub-skill: elicits validation timing, required/optional signalling, defaults, and keyboard-affordance conventions; writes `ux-input_behaviour.md`
- `skills/ux-presentation.md` — presentation sub-skill: elicits layout structure, hierarchy signals, density, progressive disclosure, and collection-display conventions; writes `ux-presentation_behaviour.md`
- `skills/ux-language.md` — language sub-skill: elicits copy tone, terminology, locale handling, variable-length text, and formatting conventions; writes `ux-language_behaviour.md`
- `skills/ux-accessibility.md` — accessibility sub-skill: elicits keyboard model, focus management, contrast targets, motion preferences, and labelling conventions; writes `ux-accessibility_behaviour.md`
- `skills/ux-adaptation.md` — adaptation sub-skill: elicits environment targets, layout reflow, dark/high-contrast support, and constrained-environment fallback conventions; writes `ux-adaptation_behaviour.md`
- `skills/ux-consistency.md` — consistency sub-skill: surfaces recurring patterns, formalises shared conventions, and captures deviation documentation rules; writes `ux-consistency_behaviour.md`
- `src/commands/init.ts` — adds 10 new filenames to `SKILL_FILES` so they are installed by `taproot init` and refreshed by `taproot update`
- `skills/guide.md` — adds UX module section to the slash commands table

## Commits
- (run `taproot link-commits` to populate)

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions (`skill-architecture/context-engineering`, `agent-agnostic-language`, `portable-output-patterns`) that run at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — implementation adds skill markdown files to `skills/` and appends filenames to the `SKILL_FILES` array in `init.ts`. This is the established pattern for all 26 existing skills. No new CLI commands, no new TypeScript modules, no architectural constraints from `docs/architecture.md` violated. Skills are agent-agnostic markdown (architecture principle: "Agent-agnostic output"). | resolved: 2026-04-11
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-11

## Status
- **State:** in-progress
- **Created:** 2026-04-11
- **Last verified:** 2026-04-11
