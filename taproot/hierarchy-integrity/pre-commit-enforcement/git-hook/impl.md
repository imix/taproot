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

## DoD Resolutions
- condition: document-current | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:49.245Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:51.647Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:51.406Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:51.167Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:50.925Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:50.686Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:50.443Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:50.208Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:49.975Z

- condition: check-if-affected: skills/guide.md | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:49.737Z

- condition: check-if-affected: src/commands/update.ts | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. git-hook impl not affected — hook installation logic unchanged; new tests cover the prompt/flag UX, not hook content. | resolved: 2026-03-21T07:49:49.488Z

