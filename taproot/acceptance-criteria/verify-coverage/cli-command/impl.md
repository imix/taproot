# Implementation: CLI Command

## Behaviour
../usecase.md

## Design Decisions
- **Grep-based ID matching**: AC-N IDs are matched as plain strings in test file content — no AST parsing. Per the spec constraint: framework-agnostic and fast enough for pre-commit use.
- **Deprecated criteria excluded**: Lines matching `~~**AC-N` (strikethrough markdown) are excluded from the spec map — retired criteria should not require test coverage.
- **`--tests` repeatable**: Can be specified multiple times to scan multiple non-default test directories.
- **Missing sections = warning, not error**: `usecase.md` files with impl children but no `## Acceptance Criteria` section are reported as warnings — exit code is only non-zero for uncovered and orphaned.
- **`--path` scopes spec collection only**: When `--path` is provided, criteria are collected only from that subtree. Test files are still scanned globally (a test for a scoped behaviour may live outside the subtree).

## Source Files
- `src/commands/acceptance-check.ts` — command implementation: collect criteria, scan tests, compute report, print output
- `src/cli.ts` — registers the `acceptance-check` command

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/acceptance-check.test.ts` — covers: criteria collection, test scanning, uncovered/orphaned/missing detection, exit codes, --path scoping, --format json, error conditions

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
