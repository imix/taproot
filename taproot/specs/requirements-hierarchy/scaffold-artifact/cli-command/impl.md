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

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — all file I/O is in src/commands/new.ts (command layer); loadConfig() called once at entry; runNew throws on error, CLI action handler catches and prints err.message only (no stack traces); error messages include correction hints per the architecture constraint | resolved: 2026-04-06
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — scaffold-artifact/usecase.md contains no NFR-N entries | resolved: 2026-04-06

## Status
- **State:** in-progress
- **Created:** 2026-04-06
- **Last verified:** 2026-04-06
