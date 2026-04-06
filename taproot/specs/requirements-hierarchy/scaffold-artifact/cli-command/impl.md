# Implementation: CLI Command — taproot new

## Behaviour
../usecase.md

## Design Decisions
- **Variadic `[args...]` for positional flexibility**: `intent` takes one positional arg (slug) while `behaviour` and `impl` take two (parent, slug). Commander's `<type> [args...]` handles this cleanly without two separate subcommand registrations.
- **Programmatic `runNew` export**: the core logic is extracted into a testable function separate from the interactive CLI wiring, following the pattern established by `runInit`, `runValidateStructure`, etc.
- **`@inquirer/input` for interactive prompts**: consistent with existing use of `@inquirer/` packages (`checkbox`, `confirm`, `select`) already in the project.
- **Slug-to-title conversion inline**: simple kebab→Title Case transform applied at template write time; no new utility needed.
- **Sub-behaviour via `usecase.md` detection**: `behaviour` type accepts any parent directory containing `intent.md` or `usecase.md` — this correctly allows both direct-child and sub-behaviour scaffolding without a separate subcommand.

## Source Files
- `src/commands/new.ts` — `runNew()` core logic + `registerNew()` commander registration
- `src/cli.ts` — registers the `new` command

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/new.test.ts` — covers AC-1 (intent scaffold), AC-2 (behaviour under intent), AC-3 (impl under behaviour), AC-4 (sub-behaviour), AC-6 (already-exists error), AC-7 (parent-not-found error), AC-8 (type-mismatch error), AC-9 (required sections present)

## Status
- **State:** complete
- **Created:** 2026-04-06
- **Last verified:** 2026-04-06

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — all file I/O in command layer (src/commands/new.ts); loadConfig() called once at entry; no global mutable state; actionable error messages with correction hints; no raw stack traces; module boundaries respected | resolved: 2026-04-06
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — scaffold-artifact/usecase.md contains no NFR-N entries | resolved: 2026-04-06

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/commands/new.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-06T08:32:58.519Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skills/*.md files modified; source files are src/commands/new.ts and src/cli.ts only | resolved: 2026-04-06T08:33:01.098Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — taproot new is a first-class CLI command in docs/cli.md; not a configurable pattern | resolved: 2026-04-06T08:33:00.815Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — taproot new is self-contained; no cross-cutting enforcement implications | resolved: 2026-04-06T08:33:00.525Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — taproot new is a CLI command, not an agent skill; pattern-hints applies to skills processing natural language needs | resolved: 2026-04-06T08:33:00.237Z

- condition: check-if-affected: examples/ | note: not affected — examples/ contains starter hierarchy templates; no CLI usage examples to update | resolved: 2026-04-06T08:32:59.955Z

- condition: check-if-affected: docs/ | note: yes — docs/cli.md updated with taproot new command documentation | resolved: 2026-04-06T08:32:59.673Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — taproot update manages agent adapters and skill files, not CLI command enumeration | resolved: 2026-04-06T08:32:59.392Z

- condition: check-if-affected: package.json | note: yes — @inquirer/input added to dependencies via npm install | resolved: 2026-04-06T08:32:59.111Z

- condition: document-current | note: docs/cli.md updated: added taproot new section under Setup (syntax, type table, slug-to-title note, interactive prompts, usage examples) | resolved: 2026-04-06T08:32:58.820Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/commands/new.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-06T08:32:58.521Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/commands/new.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-06T08:32:58.521Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/commands/new.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-06T08:32:58.521Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/commands/new.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-06T08:32:58.520Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/commands/new.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-06T08:32:58.520Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — all file I/O in command layer (src/commands/new.ts); loadConfig() called once at entry; no global mutable state; actionable error messages with correction hints; no raw stack traces; module boundaries respected | resolved: 2026-04-06T08:33:22.568Z
