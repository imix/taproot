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
- `d846153adbb16650f0ff187a3c3f8bad83fd33b8` — (auto-linked by taproot link-commits)
- `173720d22b052a5053ef0e263e88f9127d665557` — (auto-linked by taproot link-commits)

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — implementation adds 8 skill markdown files to skills/ and one architecture entry to MODULE_SKILL_FILES in init.ts. No new TypeScript CLI commands, no new core modules, no I/O boundary changes. Follows the established UX module pattern. docs/architecture.md constraints respected: agent-agnostic output, project-agnostic tooling, stateless CLI. | resolved: 2026-04-12T12:52:41.293Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-12

## Status
- **State:** complete
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: document-current | note: Read README.md and docs/ content. README.md does not enumerate individual skills or modules; it references docs/ for details. docs/modules.md was updated to add the architecture module section and move architecture from the planned table to the documented section. docs/patterns.md was updated to add architecture to the Quality module examples table. taproot/agent/docs/patterns.md synced to match. No new docs/ file needed — architecture is documented as part of the existing modules.md structure. | resolved: 2026-04-12T12:38:44.572Z
- condition: check-if-affected-by: taproot-modules/architecture | note: COMPLIANT — this impl IS the architecture module (usecase.md AC-1 through AC-11). All 7 aspects delivered: context discovery, coverage scan, per-aspect elicitation, truth file writes, /tr-sweep offer, dep governance convention + optional run: script, DoR check: wiring, DoD check-if-affected-by wiring. No TypeScript source changes — arch-naming/boundaries/error-handling/test-structure truth files do not apply. Skill files use kebab-case (arch-naming ✓). No new dependencies (arch-dependency-governance ✓). | resolved: 2026-04-12T20:52:34.782Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: COMPLIANT — all 8 skill files use the [artifact-review] pattern declaration for presenting draft truth files before writing. The orchestrator uses a coverage table block for the scan output. No raw rendering instructions. Action prompts use canonical option-letter conventions ([A] = Accept/proceed, [L] = Later/defer, [C] = Cancel, [K] = Keep, [E] = Edit, [Y] = Confirm). | resolved: 2026-04-12T12:51:58.016Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — all 8 new skill files reviewed against docs/security.md. No shell command execution in any skill file. No hardcoded credentials or tokens. Least-privilege: skills only read codebase files, write to taproot/global-truths/ (scoped truth files), and write to taproot/settings.yaml (DoR/DoD condition appends, with developer confirmation at each wiring step). All writes are within the project scope and explicitly confirmed before execution. | resolved: 2026-04-12T12:39:40.756Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO new pattern introduced. The architecture module follows the existing Quality module pattern already documented in docs/patterns.md. The patterns.md table was updated to add architecture as an example, but no new pattern type was created. | resolved: 2026-04-12T12:39:28.543Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO for taproot's own settings.yaml. The architecture module's DoD condition (check-if-affected-by: taproot-modules/architecture) is something USER PROJECTS optionally add to their own settings.yaml. Taproot itself is a developer tooling product; the condition does not apply to taproot's own implementations. | resolved: 2026-04-12T12:39:28.000Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints applies to skills that route natural-language requirement descriptions to matching patterns. The architecture module skills receive structured convention questions, not natural-language requirements. Outside the scope of this spec. | resolved: 2026-04-12T12:39:16.606Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — none of the 8 architecture module skills instruct the agent to run git commit. They reference /tr-commit in their What's next blocks as a suggested next step, which is the correct pattern. | resolved: 2026-04-12T12:39:16.309Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — all skill descriptions are concise (1-2 sentences). No embedded reference docs. No cross-skill repetition — each sub-skill covers a distinct domain aspect. File reads are on-demand (scan step at start of each sub-skill). Session hygiene signal (/compact) added to all 8 skill files before their What's next blocks. | resolved: 2026-04-12T12:39:15.996Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — arch-define pauses between aspects ([A] Extend / [L] Later) before running each sub-skill. Each sub-skill pauses before writing the truth file ([A] Write / [B] Replace / [C] Cancel). No multi-document write happens without explicit confirmation. Wiring phases each offer [A]/[B]/[C] options before writing to settings.yaml. | resolved: 2026-04-12T12:39:07.911Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — all 8 skill files (arch-define + 7 sub-skills) include a What's next block at the end of their primary output. The orchestrator presents a 3-option What's next. Sub-skills each present 2-3 options. The completion context is clear in each case. | resolved: 2026-04-12T12:39:07.638Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — all 8 skill files use generic language: 'the agent', no 'Claude' or 'Claude Code' references, no agent-specific syntax. The /tr-arch-* command prefix is the standard taproot skill invocation convention. All output is plain markdown. | resolved: 2026-04-12T12:39:07.364Z

- condition: check-if-affected: examples/ | note: No examples exercise architecture module skills directly. Not affected. | resolved: 2026-04-12T12:38:57.032Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — docs/modules.md updated to add architecture module section and move architecture from planned table to documented. docs/patterns.md updated to add architecture to the Quality module examples table. taproot/agent/docs/patterns.md synced to match. | resolved: 2026-04-12T12:38:56.740Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED AND UPDATED — skills/guide.md updated with 8 new architecture module skill entries in the slash commands table (/tr-arch-define through /tr-arch-naming). taproot/agent/skills/guide.md synced to match. | resolved: 2026-04-12T12:38:56.440Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts imports MODULE_SKILL_FILES from init.ts and iterates it to install module skills. Since MODULE_SKILL_FILES was updated in init.ts to include the architecture entry with 9 filenames, update.ts automatically picks them up at build time. No direct changes to update.ts needed. | resolved: 2026-04-12T12:38:50.301Z

- condition: check-if-affected: package.json | note: No new npm dependencies added. Source files are 8 skill markdown files and one array append in init.ts. package.json not affected. | resolved: 2026-04-12T12:38:50.016Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — implementation adds 8 skill markdown files to skills/ and one architecture entry to MODULE_SKILL_FILES in init.ts. No new TypeScript CLI commands, no new core modules, no I/O boundary changes. Follows the established UX module pattern. docs/architecture.md constraints respected: agent-agnostic output, project-agnostic tooling, stateless CLI. | resolved: 2026-04-12T12:55:02.882Z

