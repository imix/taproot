# Implementation: CLI Command — taproot sync-check

## Behaviour
../usecase.md

## Design Decisions
- Staleness is detected by comparing timestamps, not by diffing content — a pragmatic approximation that catches the most common drift scenario (code was changed without updating the spec)
- Git commit dates are preferred over filesystem mtime — mtime is unreliable after a fresh clone; git dates are stable
- Outputs only warnings (never errors) — staleness is a prompt for review, not an automated failure; the human decides whether a change is significant

## Source Files
- `src/commands/sync-check.ts` — staleness detection for impl.md (vs source files) and usecase.md (vs impl.md), CLI registration
- `src/core/git.ts` — `fileLastCommitDate()`, `fileMtime()`, `isGitRepo()`, `getRepoRoot()`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/sync-check.test.ts` — covers IMPL_STALE and SPEC_UPDATED warning scenarios

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09
