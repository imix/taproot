# Implementation: Git Hook — pre-commit enforcement

## Behaviour
../usecase.md

## Design Decisions
- The hook is installed as a shell script that delegates to `taproot commithook` — keeps the hook thin and lets the CLI handle all classification and validation logic
- Hook installation is opt-in via `--with-hooks` flag on `taproot init`, not enabled by default — avoids disrupting teams that aren't ready for enforcement yet
- If a `.git/hooks/pre-commit` already exists, the taproot check is appended rather than replacing the existing hook

## Source Files
- `src/commands/init.ts` — hook installation logic (writes/amends `.git/hooks/pre-commit`)

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/init.test.ts` — covers `--with-hooks` flag and pre-commit hook file creation

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
