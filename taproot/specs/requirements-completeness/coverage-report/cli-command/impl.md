# Implementation: CLI Command — taproot coverage

## Behaviour
../usecase.md

## Design Decisions
- Four output formats share a single data model (`CoverageReport`) and are selected at render time — the underlying data collection is format-agnostic
- Progress bars use Unicode block characters (█/─) in the tree format — visually scannable at a glance without requiring a terminal with color support
- The `context` format is a write-side-effect variant (produces a file, not stdout) — distinguished from the other formats to avoid accidentally piping it

## Source Files
- `src/commands/coverage.ts` — data collection, all four formatters (`formatTree`, `formatMarkdown`, `formatReport`, `formatContext`), CLI registration

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/coverage.test.ts` — covers all output formats including context generation and Needs Attention section population

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
