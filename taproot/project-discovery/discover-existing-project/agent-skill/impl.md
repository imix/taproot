# Implementation: Agent Skill — /tr-discover

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill rather than a CLI command — discovery requires interactive dialogue with the user to surface business goals from code; no automated heuristic can replace that conversation
- Session state is persisted to `taproot/_brainstorms/discovery-status.md` after every confirmed item — allows safe interruption and resumption without losing progress
- Phase progression is linear (Orient → Intents → Behaviours → Implementations) but each phase is checkpointed independently — the status file tracks which items are complete within each phase
- Depth control (`intents-only`, `behaviours`, `full`) allows developers to do a lightweight intent-capture session and defer detail work
- Requirements artifact detection uses naming heuristics only (prd, specs, stories, epics, adr, design, rfcs, etc.) — no hardcoded tool knowledge. The agent reads and reasons about whatever it finds; if the format is unfamiliar, it researches before proceeding
- Conflict resolution (source vs requirements) is always explicit — the developer is asked before discovery proceeds; the choice is recorded in the status file and applied throughout the session
- Requirements-only projects skip Phase 4 (impl.md creation) entirely — behaviours are written with `status: specified` rather than `implemented`

## Source Files
- `skills/discover.md` — canonical skill definition (package source)
- `.taproot/skills/discover.md` — installed copy

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — validates skill file format and required sections

## Status
- **State:** in-progress
- **Created:** 2026-03-19
- **Last verified:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: This implementation modifies skills/discover.md — a plain markdown agent skill file. Compliant with agent-agnostic output constraint. No CLI commands, no source modules, no architectural concerns apply. | resolved: 2026-03-20T00:00:00.000Z
