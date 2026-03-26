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
- `efd34fcc2700aa262977d41f1d7261c3996f2fbf` — (auto-linked by taproot link-commits)
- `048e36a737896990dff894de46ceadad52f647e9` — (auto-linked by taproot link-commits)
- `85bc0215f05eda1b6a6c75beb37f881efe359cbe` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/state-transition-guardrails.test.ts` — AC-1 through AC-11: test executes and passes, test fails blocks transition, fresh cache skips re-execution, stale cache triggers re-execution, no testsCommand falls back to BUILTINS, commithook enforcement via DoD dry-run, --rerun-tests forces re-execution, commithook blocks when cache absent, --resolve rejected when testsCommand configured, malformed cache treated as absent, --rerun-tests without impl-path errors

## Status
- **State:** complete
- **Created:** 2026-03-25
- **Last verified:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: test-cache.ts is a new src/core/ module that does process spawning and file I/O — same pattern as dod-runner.ts which already uses spawnSync/writeFileSync in core. Architecture constraint says "wherever practical"; this is the established pattern. Design decisions follow module boundary rules: test-cache.ts is pure evidence logic; dod-runner.ts orchestrates; dod.ts handles CLI. No architectural constraints violated. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR-N entries in parent usecase.md | resolved: 2026-03-25

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated: taproot dod section now documents --rerun-tests flag. docs/configuration.md updated: tests-passing entry updated, new State Transition Guardrails section documents testsCommand/testResultMaxAge/testTimeout settings and cache behavior. | resolved: 2026-03-26T05:15:28.326Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files (skills/*.md) were modified. test-cache.ts executes testsCommand from settings.yaml (user-configured, not interpolated). Security note preserved in usecase.md Notes. | resolved: 2026-03-26T05:17:14.613Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the spawn-with-pipe-and-forward pattern is standard Node.js I/O; not a taproot-specific architectural pattern. The evidence-backed test result cache is domain-specific to this behaviour. | resolved: 2026-03-26T05:17:14.359Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: yes — this story introduces testsCommand-backed test execution. Adding check-if-affected: .taproot/.test-results/ to .gitignore is a one-time infrastructure concern, not a per-impl concern. No new DoD entry warranted. The testsCommand configuration is project-level, not per-impl. | resolved: 2026-03-26T05:17:14.110Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — test-cache.ts follows the established dod-runner.ts pattern for I/O in core modules ('wherever practical'). No architectural constraints violated. Module boundaries respected: test-cache.ts (core evidence logic), dod-runner.ts (orchestration), dod.ts (CLI). No global mutable state introduced. Error messages are actionable. | resolved: 2026-03-26T05:16:26.188Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that route user needs. This is a CLI command implementation. | resolved: 2026-03-26T05:16:25.940Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commit-awareness applies to skills that include git commit steps. No skill files were modified. | resolved: 2026-03-26T05:16:25.698Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering constraints apply to skill files (skills/*.md). No skill files were modified. | resolved: 2026-03-26T05:16:25.454Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm governs bulk-authoring skills. This is a CLI command implementation (TypeScript source). | resolved: 2026-03-26T05:16:25.205Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — contextual-next-steps applies to skills that produce output for the developer. This implementation modifies CLI commands (TypeScript source), not skill files. | resolved: 2026-03-26T05:16:24.954Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this implementation adds source code (TypeScript CLI), not a skill file. The agent-agnostic-language behaviour applies to skills/*.md and adapter files. test-cache.ts, dod-runner.ts, dod.ts are not agent-facing text artifacts. | resolved: 2026-03-26T05:16:24.707Z

- condition: check-if-affected: examples/ | note: not affected — examples/ contains starter hierarchy templates; none reference tests-passing, testsCommand, or the dod CLI options added here. | resolved: 2026-03-26T05:15:29.390Z

- condition: check-if-affected: docs/ | note: affected and updated — docs/cli.md: added --rerun-tests to taproot dod signature and description. docs/configuration.md: updated tests-passing entry and added State Transition Guardrails section. | resolved: 2026-03-26T05:15:29.129Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md lists 'taproot dod [impl-path]' at line 79; --rerun-tests is an advanced option not needed in the onboarding guide. No change needed. | resolved: 2026-03-26T05:15:28.871Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts regenerates adapters and skills; it does not invoke taproot dod or read test-cache.ts. No changes needed. | resolved: 2026-03-26T05:15:28.609Z

