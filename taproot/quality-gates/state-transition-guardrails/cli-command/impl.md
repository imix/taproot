# Implementation: CLI Command — test-cache + dod-runner integration

## Behaviour
../usecase.md

## Design Decisions
- `src/core/test-cache.ts` is a new module responsible for all cache concerns: path derivation, read/write, staleness, and `testsCommand` execution. Keeping this logic out of `dod-runner.ts` preserves the single-responsibility split already established (`dod-runner.ts` orchestrates conditions; `test-cache.ts` owns evidence).
- Cache path derivation: resolve `implPath` to project-relative form, strip leading `taproot/` segment, strip trailing `/impl.md` → use result as `<key>.json` under `.taproot/.test-results/`. Handles both absolute and relative `implPath` inputs.
- `spawn` (not `spawnSync`) is used for `testsCommand` execution to satisfy the simultaneous stream + capture requirement. Output lines are piped to `process.stdout`/`process.stderr` in real time while also buffering for the `summary` field. `testTimeout` is enforced via `setTimeout` + `child.kill()`.
- `tests-passing` interception in `dod-runner.ts`: `resolveCondition` now checks if `config.testsCommand` is set when the condition name is `tests-passing`. If set, returns a special `{ evidenceBacked: true }` marker; the runner calls `runTestsPassingWithCache()` instead of `runCondition()`. When not set, falls back to BUILTINS (`npm test`) — backward compatible.
- `--resolve "tests-passing"` rejection lives in `dod.ts` in the `--resolve` path, before any write, checking `config.testsCommand`. Error is reported and process exits non-zero without touching `impl.md`.
- `--rerun-tests` flag added to `taproot dod`. Passed as `rerunTests?: boolean` through `runDodChecks` options into `test-cache.ts`.
- `testTimeout` defaults to 300 000 ms (300s) — independent of the existing `TIMEOUT_MS = 30_000` used by other DoD shell conditions.
- No changes to `commithook.ts` are needed — enforcement flows automatically through the existing `runDod({ dryRun: true })` call in the implementation tier, which now includes the evidence check.

## Source Files
- `src/core/test-cache.ts` — cache path derivation, read/write/staleness logic, `testsCommand` execution with live forwarding + capture, `testTimeout` enforcement
- `src/core/dod-runner.ts` — intercepts `tests-passing` when `config.testsCommand` is set; delegates to `test-cache.ts`; BUILTINS fallback preserved when not set
- `src/commands/dod.ts` — adds `--rerun-tests` flag; rejects `--resolve "tests-passing"` when `testsCommand` configured
- `src/validators/types.ts` — adds `testsCommand?: string`, `testResultMaxAge?: number`, `testTimeout?: number` to `TaprootConfig`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/state-transition-guardrails.test.ts` — AC-1 through AC-11: test executes and passes, test fails blocks transition, fresh cache skips re-execution, stale cache triggers re-execution, no testsCommand falls back to BUILTINS, commithook enforcement via DoD dry-run, --rerun-tests forces re-execution, commithook blocks when cache absent, --resolve rejected when testsCommand configured, malformed cache treated as absent, --rerun-tests without impl-path errors

## Status
- **State:** in-progress
- **Created:** 2026-03-25
- **Last verified:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: test-cache.ts is a new src/core/ module that does process spawning and file I/O — same pattern as dod-runner.ts which already uses spawnSync/writeFileSync in core. Architecture constraint says "wherever practical"; this is the established pattern. Design decisions follow module boundary rules: test-cache.ts is pure evidence logic; dod-runner.ts orchestrates; dod.ts handles CLI. No architectural constraints violated. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR-N entries in parent usecase.md | resolved: 2026-03-25

## DoD Resolutions
