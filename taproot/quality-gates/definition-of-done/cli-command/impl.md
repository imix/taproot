# Implementation: CLI Command — taproot dod

## Behaviour
../usecase.md

## Design Decisions
- `DodConditionEntry` is a union type (`string | { run, name?, correction? } | { 'document-current': string } | { 'check-if-affected': string }`) — bare strings are built-in aliases, objects with `run:` are shell commands, keyed objects are agent-driven conditions
- Built-in names map to predefined shell commands and corrections in a static map in `dod-runner.ts`; no special-casing in the runner loop
- **DoD baseline** always runs when `implPath` is provided — checks parent `usecase.md` exists, `state: specified`, and `validate-format` passes. Baseline results are prepended to `DodReport.results`. This means DoD can never be a no-op when run on a specific impl.
- `agentCheck: true` on a `ResolvedCondition` causes the runner to emit "Agent check required: `<description>`" — the condition fails unless a resolution is recorded in `impl.md`
- **`taproot dod --resolve <condition> --note "<text>"`** writes a resolution entry to `## DoD Resolutions` in impl.md. On subsequent runs, `readResolutions()` reads that section; matching agent checks pass.
- **Multiple `--resolve`/`--note` pairs per invocation**: `--resolve` and `--note` are array-accumulating options (Commander collect pattern). Pairs are matched by index; a missing `--note` for a given `--resolve` defaults to `''`. Single-pair invocations are unaffected.
- Resolutions are stored in `impl.md` itself, so they travel with the implementation record. Clearing the `## DoD Resolutions` section re-triggers the checks.
- **Stale resolution detection**: `readResolutions()` compares each resolution's embedded timestamp against `mtime(impl.md)`. If `mtime > latest_timestamp + 2s`, the resolution set is stale — impl.md was modified after the agent resolved the checks, so they must be re-verified. The 2s buffer accounts for the delta between `Date.now()` and the `writeFileSync` mtime.
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
- `2dbb442e0e9cabde63e667083cf9a6e329405f86` — (auto-linked by taproot link-commits)
- `de140bc4724c29bf9b651c460bcf727a69d09274` — (auto-linked by taproot link-commits)
- `4e461961391ce791134e3a49a4ee5f0bff510d59` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/dod.test.ts` — covers: no DoD configured, custom shell pass/fail, all-conditions-run, command not found, standalone mode (no impl.md change), impl.md marked complete on pass, not marked on fail, dry-run, document-current agent check, check-if-affected agent check, DoD baseline (usecase missing/state-wrong/format-invalid/all-pass), writeResolution, agent check passing after resolution, stale resolution detection (impl.md mtime > latest resolution timestamp), no-conditions-but-implPath marks complete

## Status
- **State:** needs-rework
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md documents taproot dod including --dry-run and --resolve; guide.md lists taproot dod | resolved: 2026-03-19T18:34:52.172Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — added 'Open-ended agent questions (check:)' pattern to docs/patterns.md describing when and how to use check: vs check-if-affected-by | resolved: 2026-03-20T10:57:46.667Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — adding the check: condition type is a capability enhancement to the existing DoD runner; it does not define a new architectural rule that applies to every implementation | resolved: 2026-03-20T10:57:45.455Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that route user requests; the DoD CLI command is invoked by the agent at commit time, not in response to a user expressing a need | resolved: 2026-03-20T10:57:44.173Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this implementation is a CLI command (TypeScript source), not a skill file; context-engineering constraints apply only to skill files in skills/*.md | resolved: 2026-03-20T10:57:27.071Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: This implementation is a CLI command and TypeScript parser — not a bulk-authoring skill. The pause-and-confirm behaviour applies only to skills that write multiple documents in sequence (discover, decompose). Not applicable. | resolved: 2026-03-20T07:15:41.144Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: This implementation is a CLI command (taproot dod) and a TypeScript parser — it is not a skill file. The contextual-next-steps behaviour applies to agent skill files that produce output. Not applicable. | resolved: 2026-03-20T07:15:39.917Z

- condition: check-if-affected: skills/guide.md | note: guide.md already lists taproot dod command | resolved: 2026-03-19T18:34:54.681Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts does not invoke dod; no change needed | resolved: 2026-03-19T18:34:53.462Z

