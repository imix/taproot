# Implementation: Agent Skill — Architecture Module

## Behaviour
../usecase.md

## Design Decisions
- All 8 skills (orchestrator + 7 aspect sub-skills) are implemented in a single impl record. Sub-skills are co-required by the orchestrator and have no independent value before it exists; keeping them together avoids orphaned skill files with no coverage.
- Skills are distributed via `MODULE_SKILL_FILES` in `src/commands/init.ts` under the `architecture` key — consistent with the user-experience module pattern. Projects that don't declare `architecture` in their modules list will not have these skills installed.
- Skill naming: `arch-define` (orchestrator) + `arch-<aspect>` (sub-skills). Module-prefix `arch-` is unambiguous and doesn't collide with existing skill names.
- No new CLI TypeScript commands added — the module is pure agent skill markdown files, satisfying the intent constraint "module conventions must be expressible without modifying core taproot source".
- Dependency governance sub-skill (`arch-dependency-governance.md`) presents standard convention text rather than eliciting via targeted questions — the convention ("never add a dependency without developer consent") is universal and does not vary per project. The orchestrator routes to it directly without the elicitation loop.
- DoR check: wiring for interface design and code reuse is offered in the orchestrator Phase 4 (separate from DoD wiring). These are written to `definitionOfReady` in the project's `taproot/settings.yaml`, not taproot's own settings.
- The dep governance `run:` script is offered in Phase 3 alongside the truth file write — the developer provides a stack-specific manifest diff command or skips.
- `/tr-sweep` offer is placed after all truth writes complete (Phase 2 end) before proceeding to wiring phases, matching the usecase step ordering.

## Source Files
- `skills/arch-define.md` — orchestrator skill (`/tr-arch-define`): context check, coverage scan across 7 aspects, routes to sub-skills, offers /tr-sweep, dep governance run: wiring, DoR check: wiring, DoD check-if-affected-by wiring
- `skills/arch-interface-design.md` — interface design sub-skill: elicits interface contract conventions (patterns, versioning, consistency rules); writes `arch-interface-design_behaviour.md`
- `skills/arch-code-reuse.md` — code reuse sub-skill: elicits DRY and abstraction-reuse conventions; writes `arch-code-reuse_behaviour.md`
- `skills/arch-dependency-governance.md` — dependency governance sub-skill: presents standard convention text for confirmation, offers run: script; writes `arch-dependency-governance_behaviour.md`
- `skills/arch-module-boundaries.md` — module boundaries sub-skill: elicits layer and boundary rules; writes `arch-module-boundaries_behaviour.md`
- `skills/arch-error-handling.md` — error handling sub-skill: elicits error propagation strategy; writes `arch-error-handling_behaviour.md`
- `skills/arch-test-structure.md` — test structure sub-skill: elicits test file placement and naming rules (structural half only); writes `arch-test-structure_behaviour.md`
- `skills/arch-naming.md` — naming conventions sub-skill: elicits naming rules for files, modules, and identifiers; writes `arch-naming_behaviour.md`
- `src/commands/init.ts` — adds `architecture` entry to `MODULE_SKILL_FILES` with 8 skill filenames
- `skills/guide.md` — adds 8 new skill entries to the slash commands table
- `docs/modules.md` — adds architecture module section; moves architecture from planned → documented
- `docs/patterns.md` — updates Quality module examples table to include architecture

## Commits
- (run `taproot link-commits` to populate)

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — implementation adds 8 skill markdown files to skills/ and appends 8 filenames to MODULE_SKILL_FILES in init.ts under the architecture key. Same pattern as the user-experience module. No new TypeScript CLI commands, no new core modules, no new I/O boundaries. Agent-agnostic output, project-agnostic tooling constraints respected. | resolved: 2026-04-12
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-12

## Status
- **State:** in-progress
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12
