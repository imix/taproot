# Implementation: Agent Skill — /tr-implement + /tr-decompose

## Behaviour
../usecase.md

## Design Decisions
- Slice extraction is currently handled by agent skills rather than a dedicated CLI command — agents can reason about ambiguity, dependencies, and AFK/HITL classification in ways that are hard to encode as deterministic rules
- `/tr-implement` handles the implementation of a specific slice once selected; `/tr-decompose` handles breaking a large intent into smaller implementable behaviours

## Source Files
- `skills/implement.md` — full skill definition for implementing a behaviour as a vertical slice
- `skills/decompose.md` — full skill definition for breaking an intent into behaviours

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — validates skill file format and required sections

## Status
- **State:** in-progress
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## Notes
- A `taproot plan` CLI command to programmatically surface the next implementable slice (with AFK/HITL classification and dependency ordering) is a planned addition. Currently this relies on agent skill invocation, which requires an active agent session.
