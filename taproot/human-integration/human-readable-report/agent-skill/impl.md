# Implementation: Agent Skill — /tr-status

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill that combines multiple CLI commands rather than as a single CLI command — the synthesis, prioritization, and narrative framing benefit from agent reasoning
- The skill defines a fixed output format with clear sections (Validation, Coverage, What's Working, What Needs Attention, Suggested Next Actions) so the report is predictable and skimmable

## Source Files
- `skills/status.md` — full skill definition including report format and prioritization rules

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — validates skill file format and required sections

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
