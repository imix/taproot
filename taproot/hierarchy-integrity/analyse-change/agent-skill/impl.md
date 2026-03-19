# Implementation: Agent Skill — /tr-analyse-change

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill rather than a CLI command: the core logic (confirming section interpretation, conceptual dependency matching) requires agent reasoning — there is no deterministic algorithm for identifying conceptual dependencies across free-text markdown
- Uses `taproot coverage --format json` to build the hierarchy map for structural and implementing dependency walks, avoiding manual filesystem traversal
- Conceptual matching is explicitly advisory ("possibly affected") to prevent false positives from blocking changes; the skill makes the uncertainty visible rather than hiding it
- The skill gates on caller confirmation (proceed / narrow / cancel) before returning, making it safe to call from other skills as a pre-edit guard

## Source Files
- `skills/analyse-change.md` — full skill definition implementing the usecase flow

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — validates analyse-change.md skill file format and required sections

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
