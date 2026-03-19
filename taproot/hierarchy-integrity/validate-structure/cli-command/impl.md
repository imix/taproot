# Implementation: CLI Command — taproot validate-structure

## Behaviour
../usecase.md

## Design Decisions
- Rule violations are typed as `error` or `warning` — only errors produce a non-zero exit code; warnings are informational
- Rules are implemented as pure functions in `structure-rules.ts` and composed in the command — makes individual rules unit-testable in isolation
- The `fs-walker` produces a typed tree with `marker` annotations (`intent`, `behaviour`, `impl`) so rules operate on semantically-typed nodes rather than raw filesystem paths

## Source Files
- `src/commands/validate-structure.ts` — CLI registration, orchestrates walking and rule application
- `src/validators/structure-rules.ts` — individual structure rule implementations
- `src/core/fs-walker.ts` — hierarchy walker that annotates nodes with intent/behaviour/impl markers
- `src/core/reporter.ts` — shared violation rendering and exit code logic

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/validate-structure.test.ts` — end-to-end tests for valid and invalid hierarchies
- `test/unit/structure-rules.test.ts` — unit tests for individual rule functions

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
