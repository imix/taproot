# Implementation: CLI Command — agent support tiers

## Behaviour
../usecase.md

## Design Decisions
- `AGENT_TIERS` static map lives in `src/adapters/index.ts` alongside `ALL_AGENTS` — keeps tier data co-located with the agent list
- Tier label injected into interactive `AGENT_LABELS` strings so prompt shows it inline (e.g. "Claude Code (Tier 1 — fully supported)")
- After adapter install, tier line appended to messages as a standalone line
- Tier 3 community note appended as a second line for those agents (informational only — no confirmation prompt)
- README tier table maintained as a static markdown table in `docs/agents.md`

## Source Files
- `src/adapters/index.ts` — `AGENT_TIERS` static map and `getTierLabel` helper
- `src/commands/init.ts` — interactive prompt labels with tier; tier line in install output
- `docs/agents.md` — tier table (AC-5)

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/init.test.ts` — AC-1 through AC-4, AC-6

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — AGENT_TIERS is a static map (no mutable state); tier labels are pure string formatting in commands layer; no new I/O patterns introduced. Consistent with stateless CLI and no-global-mutable-state constraints. | resolved: 2026-03-21

## Status
- **State:** declared
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21
