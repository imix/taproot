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
- `dfd471011fa3a20b815a850296dd869e1f616505` — (auto-linked by taproot link-commits)
- `e31f59824c3d3cea2bfbde6803af9b101139b5fb` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/acceptance-check.test.ts` — covers: criteria collection, test scanning, uncovered/orphaned/missing detection, exit codes, --path scoping, --format json, error conditions

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: check-if-affected: src/commands/update.ts | note: update.ts regenerates agent adapters and skill files — it does not enumerate or invoke CLI commands. Adding acceptance-check to cli.ts does not affect update.ts logic. | resolved: 2026-03-20T06:54:30.454Z
- condition: document-current | note: docs/cli.md updated: added taproot acceptance-check section under Validation with full option descriptions, output format examples, and deprecation handling note. | resolved: 2026-03-20T06:54:52.723Z

- condition: check-if-affected: skills/guide.md | note: guide.md mentions acceptance criteria in the directory structure diagram but does not list CLI commands — no update needed. The new command is documented in docs/cli.md. | resolved: 2026-03-20T06:54:31.689Z

