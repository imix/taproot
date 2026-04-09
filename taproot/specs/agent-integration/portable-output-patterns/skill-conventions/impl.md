# Implementation: Skill Conventions

## Behaviour
../usecase.md

## Design Decisions
- Pure documentation + settings wiring — no TypeScript code; this follows the same pattern as `agent-agnostic-language/settings-wiring`
- Pattern syntax uses labeled markdown blockquotes (`> **[artifact-review]**`) — readable as plain prose, no parser required; agents follow the conventions by understanding the labels semantically
- Rendering instructions defined in `docs/skill-output-patterns.md` rather than embedded in each adapter file — single source of truth that all adapter docs can reference, consistent with how `docs/configuration.md` centralises DoD condition documentation
- Four initial pattern types match the spec Notes: `artifact-review`, `confirmation`, `progress`, `next-steps`; new types are added by amending the doc + configuration table
- `check-if-affected-by: agent-integration/portable-output-patterns` added to `definitionOfDone` — fires when `skills/*.md` is staged; agent reviews the staged diff for raw rendering instructions per the Enforcement section of the patterns doc
- `naRules` entry added for `no-skill-files` — parallel to all other `check-if-affected-by` skill-only conditions

## Source Files
- `docs/skill-output-patterns.md` — defines the 4 patterns, declaration syntax, per-adapter rendering rules, and enforcement guidance
- `taproot/settings.yaml` — adds `check-if-affected-by: agent-integration/portable-output-patterns` to `definitionOfDone` and corresponding `naRules` entry
- `docs/configuration.md` — adds the new condition to the built-in cross-cutting conditions reference table

## Commits
<!-- taproot-managed -->
- `8061c0f57988be0fc5ede992d1f69fd3dff670cc` — (auto-linked by taproot link-commits)
- `1dbf62d8e07943c5405ab9be4221025caae42130` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skill-output-patterns.test.ts` — structural: file exists, is readable, has required sections (Pattern Types, Declaration Rules, Enforcement), all 4 pattern type names present

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes docs and settings.yaml only; no code design decisions; no architectural constraints apply | resolved: 2026-04-09
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md has no NFR-N entries | resolved: 2026-04-09

## Status
- **State:** complete
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: yes, updated — added ## Skill authoring references section pointing to docs/skill-output-patterns.md and global-truths/ux-principles_intent.md for skill authors | resolved: 2026-04-09T11:25:57.746Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes docs and settings.yaml only; no code design decisions; no architectural constraints apply | resolved: 2026-04-09T11:28:22.961Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: skills/guide.md modified: new ## Skill authoring references section is purely documentation prose — no shell commands, no credentials, no agent instructions. Compliant. | resolved: 2026-04-09T11:28:23.884Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no new infrastructure pattern. The output pattern convention is documented in docs/skill-output-patterns.md (its own reference doc); docs/patterns.md covers architectural patterns for taproot usage, not skill-file conventions. | resolved: 2026-04-09T11:28:23.582Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: yes — this story IS the cross-cutting concern: check-if-affected-by: agent-integration/portable-output-patterns added to definitionOfDone; fires when skills/*.md is staged | resolved: 2026-04-09T11:28:23.259Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — guide.md is an onboarding walkthrough, not a requirement-routing skill; pattern-hints applies to skills that receive natural language intent (ineed, behaviour, implement, refine) | resolved: 2026-04-09T11:28:22.527Z

- condition: check-if-affected: examples/ | note: no examples use output patterns; not affected | resolved: 2026-04-09T11:25:58.328Z

- condition: check-if-affected: docs/ | note: yes, updated — docs/skill-output-patterns.md created; docs/configuration.md updated with new condition row | resolved: 2026-04-09T11:25:58.038Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts propagates SKILL_FILES; skills/guide.md is an existing file already propagated; no change to update.ts needed | resolved: 2026-04-09T11:25:57.417Z

- condition: check-if-affected: package.json | note: no new CLI commands or npm dependencies; not affected | resolved: 2026-04-09T11:25:56.992Z

- condition: document-current | note: docs/skill-output-patterns.md created (4 patterns, per-adapter rendering). docs/configuration.md updated: portable-output-patterns row added to built-in conditions table. skills/guide.md updated: Skill Authoring References section added. README.md does not enumerate individual docs files. Docs are current. | resolved: 2026-04-09T11:30:36.765Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: this IS the portable-output-patterns implementation — self-referentially compliant; skills/guide.md additions are documentation references only, no raw rendering instructions | resolved: 2026-04-09T11:28:24.198Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: guide.md modified: new section is documentation references only, no commit steps added. Not applicable to this change. | resolved: 2026-04-09T11:27:37.045Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: skills/guide.md modified: C-1 description ~20 tokens (unchanged). C-2 no embedded docs. C-4 OVERVIEW.md still on-demand. C-5 /compact signal present (unchanged). C-6 What's next present (unchanged). New section adds ~100 tokens of prose references; no C-7 always-loaded changes. All compliant. | resolved: 2026-04-09T11:27:36.728Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: guide.md is read-only (writes no files); not applicable | resolved: 2026-04-09T11:27:36.434Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: skills/guide.md modified: the new section is informational prose with no interaction steps requiring a What's next block; guide.md already ends with a What's next block. Compliant. | resolved: 2026-04-09T11:27:36.119Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: skills/guide.md modified: new ## Skill authoring references section uses generic language ('the agent'), no agent-specific names, no @{project-root} syntax. Compliant. | resolved: 2026-04-09T11:27:35.831Z

