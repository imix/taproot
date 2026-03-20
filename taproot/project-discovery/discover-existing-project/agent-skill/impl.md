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

## DoD Resolutions
- condition: document-current | note: Not affected. discover.md changes are internal (C-5 /compact signal). No new CLI commands or configuration options. docs/ and README.md remain accurate. | resolved: 2026-03-20T09:59:21.278Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: C-5 /compact signal added before final What's next? block. C-1: description within 50 tokens. C-2/C-3/C-4: compliant. C-6: What's next? present. | resolved: 2026-03-20T09:59:27.545Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Compliant. discover.md presents each proposed intent/behaviour to the developer for confirmation before writing (see step 5 and 7 pause-and-confirm gates). | resolved: 2026-03-20T09:59:26.285Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. discover.md has a What's next? block at step 14 (final step). | resolved: 2026-03-20T09:59:25.051Z

- condition: check-if-affected: skills/guide.md | note: guide.md description of /tr-discover is independently authored and accurate. No update needed. | resolved: 2026-03-20T09:59:23.791Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. update.ts copies skill files by name; no change to file names or copy logic. | resolved: 2026-03-20T09:59:22.549Z

