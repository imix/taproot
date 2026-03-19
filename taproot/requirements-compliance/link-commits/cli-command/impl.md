# Implementation: CLI Command — taproot link-commits

## Behaviour
../usecase.md

## Design Decisions
- Commit matching supports both `taproot(<path>): msg` footer format and a configurable `commitPattern` regex — makes the feature work with teams that have existing commit conventions
- Impl nodes are indexed by both repo-root-relative path and taproot-root-relative path for flexible matching — commits tagged with either form are recognized
- Existing hashes are read before scanning git log so duplicate linking is never introduced, even when running the command repeatedly

## Source Files
- `src/commands/link-commits.ts` — CLI registration, hierarchy indexing, git log scanning, impl.md patching
- `src/core/git.ts` — `gitLog()`, `extractTaprootPath()`, `isGitRepo()`, `getRepoRoot()`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/link-commits.test.ts` — covers commit matching, deduplication, dry-run mode, and impl.md mutation

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
