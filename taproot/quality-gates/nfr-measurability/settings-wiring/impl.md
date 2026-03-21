# Implementation: Settings Wiring

## Behaviour
../usecase.md

## Design Decisions
- Activated via `check-if-affected-by: quality-gates/nfr-measurability` in `definitionOfReady` — reuses existing DoR runner agent-check machinery; no new runner code needed
- The check is entirely agent-driven: at declaration time the agent reads the parent `usecase.md`, collects `**NFR-N:**` entries, and inspects each `Then` clause for a measurable threshold (digit+unit, named standard, or testable boolean)
- Measurability heuristics from usecase.md Notes are the authoritative reference for what "passes": number+unit (`200ms`, `60%`), named standard (`WCAG 2.1 AA`, `PCI DSS 4.0`), testable boolean ("account is locked", "notification is sent"). Pure adjectives ("fast", "secure") without qualification always fail.
- No automated test — activation is verified by the DoR runner's existing `check-if-affected-by` test coverage; threshold reasoning is agent judgement, not parseable by static tests

## Source Files
- `.taproot/settings.yaml` — adds `check-if-affected-by: quality-gates/nfr-measurability` to `definitionOfReady`

## Commits
<!-- taproot-managed -->

## Tests
- (no automated test — agent-driven check; verified by DoR runner's existing check-if-affected-by integration test coverage)

## Status
- **State:** in-progress
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes only .taproot/settings.yaml (a config file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21
