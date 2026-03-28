# Implementation: Agent Skill — /tr-next

## Behaviour
../usecase.md

## Design Decisions
- A dedicated `/tr-next` skill wraps `taproot plan` with conversational selection, confirmation, and delegation — separating the CLI scanning logic (deterministic, testable) from the agent dialogue layer (conversational, context-aware)
- AFK/HITL classification delegates to `taproot plan` rather than re-implementing the logic: the CLI command uses `usecase.md` state as the proxy (`specified` → AFK, `proposed` → HITL), which is concrete and testable
- The skill presents one recommendation by default (top AFK candidate) and offers a shortlist on request — minimising cognitive load for the common case while preserving full visibility

## Source Files
- `skills/next.md` — full skill definition: scans via `taproot plan`, presents recommended slice, handles alternate flows (shortlist, all-done, path-specified), delegates to `/tr-implement`
- `src/commands/plan.ts` — backing CLI command providing candidate scanning, AFK/HITL classification, and output formatting

## Commits
- (run `taproot link-commits` to populate)
- `da06fc8aca181df9a21d0ed4740274c85608f71c` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — validates plan.md skill file format and required sections
- `test/integration/plan.test.ts` — covers the underlying `taproot plan` CLI: AFK/HITL classification, in-progress detection, sort order, all-implemented message, tree and JSON output

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
