# Implementation: Commithook Proposed-State Gate

## Behaviour
../usecase.md

## Design Decisions
- Gate triggers only on newly added files (`--diff-filter=A`), not modifications — allows state upgrades (proposed → specified) to be committed without looping
- Pattern match against `State: proposed` in staged content (not working tree) ensures the gate sees exactly what would be committed
- Error message includes actionable instructions: show spec to developer, wait for [Y], change state to `specified`

## Source Files
- `src/commands/commithook.ts` — `getNewlyAddedFiles()` helper + proposed-state gate check
- `dist/commands/commithook.js` — compiled output
- `skills/behaviour.md` — two-phase write in Step 9 (proposed → confirm → specified)
- `test/integration/commithook.test.ts` — 4 new tests in `describe('runCommithook — proposed-state gate')`

## Commits
- (run `taproot link-commits` to populate)
- `a930c9c824ef330e81ea72bdc60d939d1a8a71a2` — (auto-linked by taproot link-commits)
- `8f2eb5a8b38beabd7eeb53653f583f60675d44de` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — 4 tests: proposed blocked, specified passes, implemented passes, modified-proposed passes

## Status
- **State:** complete
- **Created:** 2026-03-30
- **Last verified:** 2026-03-30

## DoD
- [x] New `usecase.md` with `State: proposed` → blocked (exit 1)
- [x] New `usecase.md` with `State: specified` → passes (exit 0)
- [x] New `usecase.md` with `State: implemented` → passes (exit 0)
- [x] Modified (not new) `usecase.md` with `State: proposed` → passes (exit 0)
- [x] 4 tests pass in `commithook.test.ts`

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — `getNewlyAddedFiles()` and the proposed-state check are pure git/string logic added to `src/commands/commithook.ts`; no I/O beyond existing git subprocess calls; no global state; no architectural constraints violated | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — this impl introduces no performance or reliability requirements; the added hook check is a synchronous string match on staged file content, negligible overhead | resolved: 2026-03-30
