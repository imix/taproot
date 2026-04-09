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

## Tests
- `test/unit/skill-output-patterns.test.ts` — structural: file exists, is readable, has required sections (Pattern Types, Declaration Rules, Enforcement), all 4 pattern type names present

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes docs and settings.yaml only; no code design decisions; no architectural constraints apply | resolved: 2026-04-09
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md has no NFR-N entries | resolved: 2026-04-09

## Status
- **State:** in-progress
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09
