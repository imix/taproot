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
- `c62da02c7e1cd1c62b66412b9cbb6b807dec86a7` — (auto-linked by taproot link-commits)
- `54718342a65e1b2020c2015e15f948a1fb0dee8d` — (auto-linked by taproot link-commits)
- `9ed1d2b936b9a8be5a0c57bfc09d94de969f40d4` — (auto-linked by taproot link-commits)

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions (`skill-architecture/context-engineering`, `agent-agnostic-language`, `portable-output-patterns`) that run at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-11

## Status
- **State:** complete
- **Created:** 2026-04-11
- **Last verified:** 2026-04-11

## DoD Resolutions
- condition: document-current | note: Read README.md and docs/ content. Read diff for this impl. README.md does not enumerate individual skills; the full skill list lives in skills/guide.md (which is updated). A new feature large enough to warrant its own doc was introduced: the quality modules system. Created docs/modules.md documenting what modules are, how to activate them, the user-experience module with its 9 aspects, and the planned future modules. docs/patterns.md updated with the Quality module pattern. | resolved: 2026-04-11T08:54:26.027Z
- condition: check-if-affected-by: taproot-modules/architecture | note: NOT APPLICABLE to TypeScript source (none in this impl). Skill markdown files verified: all kebab-case (arch-naming ✓), no new dependencies (arch-dependency-governance ✓), arch-module-boundaries/error-handling/test-structure/code-reuse do not apply (no TypeScript). arch-interface-design: option-letter conventions already verified in prior resolution. taproot-modules/architecture/usecase.md describes Activate Architecture Module — a distinct behaviour; this impl delivers Activate UX Module. No compliance gap. | resolved: 2026-04-12T21:07:35.701Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — this implementation adds skill markdown files to skills/ and appends filenames to SKILL_FILES in init.ts. This is the established pattern used by all existing skills. No new TypeScript commands, no new architectural modules. All source files are agent-agnostic markdown or a simple array append. docs/architecture.md constraints respected: agent-agnostic output, project-agnostic tooling, stateless CLI. | resolved: 2026-04-11T08:57:09.637Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: COMPLIANT — all 10 skill files use the [artifact-review] pattern declaration for presenting draft truth files before writing. The orchestrator uses a progress/table block for coverage scan output. No raw rendering instructions ('print the file', 'display the contents'). Action prompts use the canonical option-letter conventions ([A] = Accept/proceed, [C] = Cancel, [S] = Skip). | resolved: 2026-04-11T08:54:26.028Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — all 10 new skill files reviewed against security.md. No shell command execution in any skill file. No hardcoded credentials or tokens. Least-privilege: skills only read codebase files, write to taproot/global-truths/ (scoped truth files), and write to taproot/settings.yaml (one DoD condition append, with developer confirmation). All writes are within the project scope and explicitly confirmed by the developer before execution. | resolved: 2026-04-11T08:54:26.029Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: YES — the module activation pattern (orchestrator skill + sub-skills per domain aspect + scoped global truth files + optional DoD wiring) is reusable for future modules (security, architecture, testing, etc.). Added 'Quality module' pattern to docs/patterns.md and synced taproot/agent/docs/patterns.md. | resolved: 2026-04-11T08:54:34.653Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO for taproot's own settings.yaml. The UX module's DoD condition (check-if-affected-by: taproot-modules/user-experience) is something USER PROJECTS optionally add to their own settings.yaml. Taproot itself is a developer tooling product without UX surfaces — the condition does not apply to taproot's own implementations. | resolved: 2026-04-11T08:54:34.655Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints applies to skills that route natural-language requirement descriptions to matching patterns. The UX module skills receive structured UX questions, not natural-language requirements. They do not route requirements; they elicit domain-specific conventions. Outside the scope of this spec. | resolved: 2026-04-11T08:54:34.656Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — none of the 10 UX module skills instruct the agent to run git commit. They reference /tr-commit in their What's next blocks as a suggested next step, which is the correct pattern. The pre-commit context step requirement in the spec only applies to skills that directly orchestrate git commits. | resolved: 2026-04-11T08:54:44.189Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT after fix. C-1: All skill descriptions are concise (1-2 sentences, under 50 tokens). C-2: No embedded reference docs. C-3: No cross-skill repetition — each sub-skill covers a distinct domain. C-4: File reads are on-demand per step (step 1: scan for existing truth file only). C-5: Session hygiene signal added to all 9 sub-skills before their What's next blocks; orchestrator already had the signal. | resolved: 2026-04-11T08:54:44.191Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — ux-define pauses between aspects ([A] Extend / [S] Skip) before running each sub-skill. Each sub-skill pauses before writing the truth file ([A] Write or extend / [B] Replace / [C] Cancel). No multi-document write happens without explicit confirmation. | resolved: 2026-04-11T08:54:44.192Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — all 10 skills (ux-define + 9 sub-skills) include a What's next block at the end of their primary output. The orchestrator (ux-define) presents a 3-option What's next. Sub-skills each present 2-3 options. The completion context is clear in each case. | resolved: 2026-04-11T08:54:52.234Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — all 10 skill files use generic language: 'the agent', no 'Claude' or 'Claude Code' references, no @{project-root} path syntax (Claude Code-specific). The /tr-ux-* command prefix is the standard taproot skill invocation convention used across all 26 existing skills, not a Claude-specific mechanism. | resolved: 2026-04-11T08:54:52.236Z

- condition: check-if-affected: examples/ | note: No examples exercise UX module skills directly. Not affected. | resolved: 2026-04-11T08:54:52.237Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — created docs/modules.md documenting the quality modules system and the user-experience module. Updated docs/patterns.md with the Quality module pattern entry. Synced taproot/agent/docs/patterns.md to match. | resolved: 2026-04-11T08:54:59.584Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED AND UPDATED — skills/guide.md updated with 10 new UX module skill entries in the slash commands table (/tr-ux-define through /tr-ux-consistency). taproot/agent/skills/guide.md synced to match. | resolved: 2026-04-11T08:54:59.586Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts imports SKILL_FILES from init.ts and iterates it to install skills. Since SKILL_FILES was updated in init.ts to include the 10 new skill filenames, update.ts automatically picks them up at build time. No direct changes to update.ts needed. | resolved: 2026-04-11T08:54:59.586Z

- condition: check-if-affected: package.json | note: No new npm dependencies added. Source files are skill markdown files and one array append in init.ts. package.json not affected. | resolved: 2026-04-11T08:54:59.587Z

