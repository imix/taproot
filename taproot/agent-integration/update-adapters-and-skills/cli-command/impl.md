# Implementation: CLI Command — taproot update

## Behaviour
../usecase.md

## Design Decisions
- Agent detection is heuristic-based (scan for characteristic files) rather than config-based — avoids requiring developers to maintain a list of installed agents in `.taproot.yaml`; the filesystem is the source of truth
- Stale path removal is encoded as a static list of known old layouts (`STALE_PATHS`) — explicit, auditable, and easy to extend as the tool evolves
- OVERVIEW.md regeneration is always included in the update — keeps the overview current after any skill changes without requiring a separate command

## Source Files
- `src/commands/update.ts` — agent detection, stale path removal, adapter regeneration, skill refresh, overview regeneration

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/update.test.ts` — covers detection of installed agents, stale path removal, adapter regeneration

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
