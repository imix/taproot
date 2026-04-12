# Implementation: Agent Skill — Architectural Style Sub-skill

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a standalone skill file (`skills/arch-style.md`) rather than inline in `arch-define.md`, consistent with the other 7 aspect sub-skills. This allows the step to be re-run independently to update the declared style without re-running all 7 aspects.
- Registered in `MODULE_SKILL_FILES` under `architecture` so it is distributed to projects that declare the architecture module, following the established module skill distribution pattern.
- Phase 0b placement in `arch-define.md`: style step runs after project context is confirmed (Phase 0) and before the coverage scan (Phase 1). Project context (stack) must be established first because it informs the stack-informed suggestion branch.
- Active propagation implemented in `arch-module-boundaries.md` only (the most directly impacted sub-skill). Other aspect sub-skills note the file in their scan step generically. Module-boundaries gets specific style-adaptive question text for hexagonal, clean, and microservices styles.
- Confidence signals use `[High confidence]` / `[Low confidence]` inline markers — consistent with the `[artifact-review]` pattern convention for bracketed status markers in skill output.
- The `arch-style_behaviour.md` file format uses `## Core Rules` / `## Extended Rules` sections for named styles and a flat `## Conventions` section for custom/question-led output, keeping the format distinguishable and machine-readable.

## Source Files
- `skills/arch-style.md` — sub-skill implementing define-architectural-style: style declaration, rules branches, stack-informed suggestions, question-led elicitation, writes `arch-style_behaviour.md`
- `skills/arch-define.md` — adds Phase 0b that invokes arch-style step; updates coverage table to include style; updates session summary
- `skills/arch-module-boundaries.md` — scan step reads `arch-style_behaviour.md` if present; targeted questions adapt to declared style
- `src/commands/init.ts` — adds `arch-style.md` to `MODULE_SKILL_FILES` under `architecture`
- `skills/guide.md` — adds `/tr-arch-style` entry to architecture module skill table

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/update.modules.test.ts` — existing tests cover arch-style.md installation via MODULE_SKILL_FILES (the pattern is already validated; arch-style.md just needs to be present in the files array)
- `test/unit/skills.test.ts` — existing SKILL_FILES checks do not cover MODULE_SKILL_FILES entries directly; arch-style.md is validated via the module installation test

## DoR Resolutions

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: design decisions follow established taproot sub-skill patterns: standalone skill file, MODULE_SKILL_FILES registration, orchestrator invocation with suppressed What's next, scan step reading existing truth file | resolved: 2026-04-12
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR criteria in parent usecase.md | resolved: 2026-04-12
- condition: check: does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md? | note: no conflict — arch-style.md follows the existing arch sub-skill interface pattern (scan → elicit → draft → [artifact-review] → write); no existing patterns are changed | resolved: 2026-04-12
- condition: check: does an existing abstraction already cover this? See arch-code-reuse_behaviour.md | note: no existing abstraction covers style-aware elicitation with known-styles list and confidence signals; this is new functionality | resolved: 2026-04-12

## Status
- **State:** complete
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: arch-style.md uses generic language throughout — 'the agent', 'developer', bracketed options. No Claude-specific terms, no CLAUDE.md references, no @{project-root} syntax. | resolved: 2026-04-12T21:58:21.436Z
- condition: document-current | note: docs/modules.md updated with Phase 0b section documenting /tr-arch-style, canonical styles list, and standalone invocation. README.md does not enumerate individual module sub-skills — no update needed. docs/ accurately reflects the new arch-style sub-skill. | resolved: 2026-04-12T22:00:29.301Z

- condition: check-if-affected: examples/ | note: Not applicable — no examples reference the architecture module skill set; no example demonstrates arch-style. | resolved: 2026-04-12T22:00:19.384Z

- condition: check-if-affected: docs/ | note: Applied — docs/modules.md updated: added Phase 0b section describing /tr-arch-style, supported styles, and standalone invocation. | resolved: 2026-04-12T22:00:19.099Z

- condition: check-if-affected: skills/guide.md | note: Applied — guide.md updated with /tr-arch-style entry in the architecture module section of the slash command table. | resolved: 2026-04-12T22:00:18.813Z

- condition: check-if-affected: src/commands/update.ts | note: Not applicable — update.ts imports MODULE_SKILL_FILES from init.ts and calls installModuleSkills() generically. No changes needed; arch-style.md is automatically picked up via the architecture module's updated MODULE_SKILL_FILES entry. | resolved: 2026-04-12T21:59:55.455Z

- condition: check-if-affected: package.json | note: Not applicable — no new npm dependencies added. arch-style.md is a skill file; init.ts change adds a string to MODULE_SKILL_FILES array only. | resolved: 2026-04-12T21:59:55.184Z

- condition: check-if-affected-by: taproot-modules/architecture | note: Compliant — implementation follows architecture module conventions: standalone sub-skill, MODULE_SKILL_FILES entry, truth file written to taproot/global-truths/, scan step reads existing file. No layer boundary violations. | resolved: 2026-04-12T21:59:46.975Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: arch-style.md uses bracketed option patterns ([A]/[B]/[L]/[E]/[C]/[S]) and [artifact-review] for structured write confirmations throughout. No raw agent-specific rendering instructions. | resolved: 2026-04-12T21:59:46.617Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: arch-style.md, arch-define.md, arch-module-boundaries.md: no shell command execution, no credentials or tokens, all agent instructions are file reads and structured elicitation. Least-privilege: skill reads and writes only explicitly named truth files in taproot/global-truths/. | resolved: 2026-04-12T21:59:37.631Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No — the stack-informed confidence signal pattern is specific to quality module sub-skills. Not general enough to add to docs/patterns.md. | resolved: 2026-04-12T21:59:31.339Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No — the arch-style behaviour extends the existing architecture module. check-if-affected-by: taproot-modules/architecture already covers implementations that may be affected by architectural style conventions. | resolved: 2026-04-12T21:59:31.049Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant — design decisions follow established taproot patterns: standalone sub-skill file, MODULE_SKILL_FILES registration, orchestrator invocation with suppressed What's next, scan step reading existing truth file. | resolved: 2026-04-12T21:59:23.477Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable — arch-style.md is a document-writing skill invoked explicitly, not a routing skill that receives open-ended user needs from which patterns are surfaced. | resolved: 2026-04-12T21:59:23.208Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — arch-style.md writes a global-truth file; it does not perform git commits. The commit step is delegated to /tr-commit via the What's next block. | resolved: 2026-04-12T21:59:15.604Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: C-1: description is ~40 tokens. C-2: no embedded reference docs. C-3: no cross-skill repetition. C-4: files read on-demand (arch-style_behaviour.md in step 1 only if exists; project-context_intent.md in step 2 only if present). C-5: session hygiene signal present before What's next block. | resolved: 2026-04-12T21:59:15.336Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: arch-style.md shows [artifact-review] with [A]/[C] confirmation before writing arch-style_behaviour.md. Extend path also offers [A]/[C] per write. All writes gate on explicit confirmation. | resolved: 2026-04-12T21:59:05.137Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: arch-style.md ends with a What's next block offering 3 options: /tr-arch-module-boundaries, /tr-arch-define, /tr-commit. Suppressed when invoked from arch-define orchestrator. | resolved: 2026-04-12T21:59:04.865Z

