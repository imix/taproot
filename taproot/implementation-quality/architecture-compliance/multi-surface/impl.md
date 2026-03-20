# Implementation: Multi-surface — config + architecture doc

## Behaviour
../usecase.md

## Design Decisions
- Activated via `check-if-affected-by: implementation-quality/architecture-compliance` in `definitionOfReady` — reuses existing DoR runner agent-check machinery; no new runner code needed
- `docs/architecture.md` is a freeform document, not a usecase — captures decisions, constraints, and patterns the team has agreed on
- AC-4 (missing architecture doc): the DoR runner will fail the check as unresolved; a capable agent resolving it will surface the missing doc. A machine-readable guard (`run: test -f docs/architecture.md`) is deferred as a future enhancement.

## Source Files
- `.taproot/settings.yaml` — adds `check-if-affected-by: implementation-quality/architecture-compliance` to `definitionOfReady`
- `docs/architecture.md` — the architecture document; its existence is the precondition for the check to run

## Commits
- (run `taproot link-commits` to populate)

## Tests
- (no automated test — activation is verified by the DoR runner's existing `check-if-affected-by` test coverage; the architecture doc's content is human-maintained)

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
