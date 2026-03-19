# Implementation: Agent Skill — /tr-discover

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill rather than a CLI command — discovery requires interactive dialogue with the user to surface business goals from code; no automated heuristic can replace that conversation
- Session state is persisted to `taproot/_brainstorms/discovery-status.md` after every confirmed item — allows safe interruption and resumption without losing progress
- Phase progression is linear (Orient → Intents → Behaviours → Implementations) but each phase is checkpointed independently — the status file tracks which items are complete within each phase
- Depth control (`intents-only`, `behaviours`, `full`) allows developers to do a lightweight intent-capture session and defer detail work

## Source Files
- `skills/discover.md` — canonical skill definition (package source)
- `.taproot/skills/discover.md` — installed copy

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — validates skill file format and required sections

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
