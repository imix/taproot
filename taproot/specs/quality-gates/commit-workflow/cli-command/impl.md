# Implementation: CLI Command

## Behaviour
../usecase.md

## Design Decisions
- **`taproot commit` delegates truth-sign internally**: The command reuses `runTruthSign()` from `truth-sign.ts` — no duplication of signing logic. If truth-sign exits non-zero the commit is aborted before `git commit` runs.
- **Only stages `.taproot/.truth-check-session` automatically**: No other implicit staging. All other file selection is explicit (`--all` or prior `git add`).
- **`stdio: 'inherit'` for `git commit`**: The pre-commit hook output (taproot commithook) must reach the developer's terminal verbatim. Using `stdio: 'inherit'` ensures hook output is not swallowed.
- **Hierarchy detection is identical to `truth-sign.ts`**: Uses the same path-prefix filter (`taproot/`, excluding `global-truths/` and `agent/`) so the truth-sign decision is consistent.
- **No implicit DoD**: `taproot commit` does not run DoD. DoD is enforced by the pre-commit hook, not by this command. The command's job is workflow orchestration, not quality checking.

## Source Files
- `src/commands/commit.ts` — new `taproot commit` command
- `src/cli.ts` — added `registerCommit` import and call

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/commit-workflow.test.ts` — covers AC-2 through AC-5, AC-7: truth-sign skipped for source-only, truth-sign skipped without global-truths, --all stages all, nothing-staged error, dry-run makes no changes

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed docs/architecture.md; this implementation adds a new thin CLI command (src/commands/commit.ts) registered in cli.ts. No new modules, no new commands beyond the single taproot commit wrapper. Delegates to existing truth-sign.ts. Agent-agnostic output preserved. Compliant. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — commit-workflow/usecase.md contains no NFR-N entries in ## Acceptance Criteria. No performance, reliability, or accessibility thresholds. | resolved: 2026-03-29

## Status
- **State:** in-progress
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29

## DoD Resolutions
