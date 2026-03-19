# Implementation: CLI Command — taproot check-orphans

## Behaviour
../usecase.md

## Design Decisions
- Behaviour reference checking resolves the path relative to the `impl.md` file — matches the `../usecase.md` convention used by all impl.md files
- Source file path resolution handles two cases: relative paths (resolved from the impl folder) and project-root-relative paths (e.g. `src/foo.ts`) — mirrors how developers naturally write paths in impl.md
- `--include-unimplemented` is opt-in rather than default to avoid noise in early-stage projects where many behaviours are intentionally not yet implemented

## Source Files
- `src/commands/check-orphans.ts` — reference checking, violation collection, CLI registration
- `src/core/impl-reader.ts` — parses `impl.md` to extract behaviour refs, source files, test files, and commits
- `src/core/reporter.ts` — shared violation rendering and exit code logic

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/check-orphans.test.ts` — covers broken behaviour refs, missing source/test files, invalid commits, and unimplemented behaviour detection

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
