# Discussion: CLI Command — test-cache + dod-runner integration

## Session
- **Date:** 2026-03-25
- **Skill:** tr-implement

## Pivotal Questions

**1. Should `tests-passing` with no `testsCommand` fall back to agent assertion or preserve the existing BUILTINS behavior?**

The original spec said "agent assertion fallback" — but this breaks every existing project using `tests-passing: npm test` implicitly. The review (tr-review) flagged this as a Blocker. Resolution: preserve BUILTINS (`npm test`) as the no-`testsCommand` fallback. The evidence-backed path only activates when `testsCommand` is explicitly configured.

**2. Does commithook enforcement need new code, or does it flow through the existing DoD dry-run?**

Initially described in the spec as a separate alternate flow ("Commithook reads the cache file"). The review identified this would duplicate logic already in the existing `runDod({ dryRun: true })` call. Resolution: no new commithook code — the evidence check is wired into `dod-runner.ts`, so the existing dry-run path picks it up automatically.

**3. `spawnSync` vs `spawn` for test execution?**

`spawnSync` with `stdio: 'inherit'` streams but can't capture. `spawnSync` with `pipe` captures but doesn't stream. The spec requires both. Resolution: use `spawn` with piped stdio, manually forwarding each line to `process.stdout`/`process.stderr` while buffering for `summary`. This adds async complexity but is the only correct approach.

## Alternatives Considered

- **Agent assertion fallback when no `testsCommand`** — rejected: breaking change for existing projects; BUILTINS fallback preserved instead.
- **Shared cache per test run (not per impl)** — rejected: adds significant complexity (coordinating across concurrent DoD calls); per-impl cache is simpler and provides clear per-impl audit trails.
- **`testTimeout` reusing existing `TIMEOUT_MS`** — rejected: `TIMEOUT_MS = 30s` is appropriate for fast shell commands; test suites often run 1–10 minutes. New independent `testTimeout` default of 300s.

## Decision

New `src/core/test-cache.ts` module owns all evidence concerns (path derivation, read/write, staleness, execution). `dod-runner.ts` intercepts the `tests-passing` condition and delegates to it when `config.testsCommand` is set; otherwise falls back to BUILTINS unchanged. `--resolve "tests-passing"` is rejected in `dod.ts` before write. No commithook changes needed.

## Open Questions
- None — all design branches resolved during review + refine cycle.
