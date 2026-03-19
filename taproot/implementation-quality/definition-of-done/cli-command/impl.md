# Implementation: CLI Command

## Behaviour
../usecase.md

## Design Decisions
- `DodConditionEntry` is a union type (`string | { run, name?, correction? }`) matching Option B syntax from the spec — bare strings are built-in aliases, objects with `run:` are shell commands
- Built-in names map to predefined shell commands and corrections in a static map in `dod-runner.ts`; no special-casing in the runner loop
- All conditions always run (no short-circuit on failure) to satisfy the "run all, report all" requirement
- `markImplComplete` uses a regex replace on the Status section rather than re-parsing markdown, consistent with how `link-commits` appends to `impl.md`
- Exit code 127 (shell "command not found") is detected explicitly and returns the "ensure executable" correction rather than the generic fallback
- State update logic lives in `runDod` (not just the CLI action) so tests can verify it without spawning a subprocess
- YAML key must be `definitionOfDone` (camelCase) to match the TypeScript field name, since `loadConfig` uses `deepMerge` without snake_case/kebab-case conversion

## Source Files
- `src/core/dod-runner.ts` — parses conditions, runs each as a shell command, returns DodReport
- `src/commands/dod.ts` — `taproot dod [impl-path]` CLI command; calls runDodChecks, updates impl.md state on success
- `src/validators/types.ts` — added `DodConditionEntry` type and `definitionOfDone?` field to `TaprootConfig`
- `src/cli.ts` — registered `registerDod`

## Commits
- (to be filled by taproot link-commits)
- `2dbb442e0e9cabde63e667083cf9a6e329405f86` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/dod.test.ts` — covers: no DoD configured, custom shell pass/fail, all-conditions-run, command not found, standalone mode (no impl.md change), impl.md marked complete on pass, not marked on fail, dry-run

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
