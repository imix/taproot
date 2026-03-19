# Implementation: CLI Command — taproot dod

## Behaviour
../usecase.md

## Design Decisions
- `DodConditionEntry` is a union type (`string | { run, name?, correction? } | { 'document-current': string } | { 'check-if-affected': string }`) — bare strings are built-in aliases, objects with `run:` are shell commands, keyed objects are agent-driven conditions
- Built-in names map to predefined shell commands and corrections in a static map in `dod-runner.ts`; no special-casing in the runner loop
- **DoD baseline** always runs when `implPath` is provided — checks parent `usecase.md` exists, `state: specified`, and `validate-format` passes. Baseline results are prepended to `DodReport.results`. This means DoD can never be a no-op when run on a specific impl.
- `agentCheck: true` on a `ResolvedCondition` causes the runner to emit "Agent check required: `<description>`" — the condition fails unless a resolution is recorded in `impl.md`
- **`taproot dod --resolve <condition> --note "<text>"`** writes a resolution entry to `## DoD Resolutions` in impl.md. On subsequent runs, `readResolutions()` reads that section; matching agent checks pass.
- Resolutions are stored in `impl.md` itself, so they travel with the implementation record. Clearing the `## DoD Resolutions` section re-triggers the checks.
- `check-if-affected: <target>` is an agent-driven condition: agent reads the git diff and reasons whether `<target>` should have been updated; if so, applies changes and records resolution
- All conditions always run (no short-circuit on failure) to satisfy the "run all, report all" requirement
- `markImplComplete` uses a regex replace on the Status section — consistent with how `link-commits` appends to `impl.md`
- Exit code 127 (shell "command not found") is detected explicitly and returns the "ensure executable" correction rather than the generic fallback
- State update logic lives in `runDod` (not just the CLI action) so tests can verify it without spawning a subprocess
- YAML key must be `definitionOfDone` (camelCase) to match the TypeScript field name

## Source Files
- `src/core/dod-runner.ts` — parses conditions, runs baseline, runs each condition as a shell command or agent check, reads resolutions from impl.md; returns DodReport
- `src/commands/dod.ts` — `taproot dod [impl-path]` CLI command; `--dry-run` and `--resolve`/`--note` options; calls runDodChecks, updates impl.md state on success; `writeResolution` exported for tests
- `src/validators/types.ts` — `DodConditionEntry` type and `definitionOfDone?` / `definitionOfReady?` fields on `TaprootConfig`
- `src/cli.ts` — registered `registerDod`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/dod.test.ts` — covers: no DoD configured, custom shell pass/fail, all-conditions-run, command not found, standalone mode (no impl.md change), impl.md marked complete on pass, not marked on fail, dry-run, document-current agent check, check-if-affected agent check, DoD baseline (usecase missing/state-wrong/format-invalid/all-pass), writeResolution, agent check passing after resolution, no-conditions-but-implPath marks complete

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md documents taproot dod including --dry-run; guide.md lists taproot dod | resolved: 2026-03-19T18:08:00Z
- condition: check-if-affected: src/commands/update.ts | note: update.ts doesn't invoke dod; no change needed | resolved: 2026-03-19T18:08:00Z
- condition: check-if-affected: skills/guide.md | note: guide.md already lists taproot dod command | resolved: 2026-03-19T18:08:00Z
