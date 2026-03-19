# Implementation: CLI Command — taproot coverage --format context

## Behaviour
../usecase.md

## Design Decisions
- CONTEXT.md is generated as a side-effect of `taproot coverage --format context` rather than a dedicated command — avoids command proliferation for what is essentially a coverage report variant
- The context format includes a "Needs Attention" section (in-progress, untested, unimplemented) to make gaps immediately visible to agents loading the file
- Output path is always `taproot/CONTEXT.md` — fixed location so agents can reliably find it without configuration

## Source Files
- `src/commands/coverage.ts` — `formatContext()` function implements the context format; `runCoverage()` provides the underlying data

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/coverage.test.ts` — covers context format output including the Needs Attention section

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
