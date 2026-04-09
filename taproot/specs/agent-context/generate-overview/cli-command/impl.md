# Implementation: CLI Command — taproot overview

## Behaviour
../usecase.md

## Design Decisions
- Output is written to `taproot/OVERVIEW.md` rather than stdout so agents can load it as a persistent context file without running a command each time
- Overview is regenerated automatically by `taproot update` and by any tree-modifying skill (intent, behaviour, implement, etc.) — keeps it current without manual invocation
- Intentionally compact: one line per behaviour, implementation state and counts inline — fits in a single agent context window even for large hierarchies

## Source Files
- `src/commands/overview.ts` — walks hierarchy, extracts goal/actor/state/counts per node, writes OVERVIEW.md

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/phase5.test.ts` — covers overview generation as part of the full lifecycle test

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09
