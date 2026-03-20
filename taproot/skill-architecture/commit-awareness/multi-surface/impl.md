# Implementation: Multi-Surface — settings.yaml + implement.md + tests

## Behaviour
../usecase.md

## Design Decisions
- Enforced via `check-if-affected-by: skill-architecture/commit-awareness` in `.taproot/settings.yaml` — same pattern as `context-engineering`; this makes the constraint automatic at DoD time for every future skill implementation
- Changes to `skills/implement.md` are targeted additions to steps 6 and 9 only — step 6 (declaration commit) gets pre-commit context for DoR, step 9 (implementation commit) gets commit classification and real-diff guidance; step 8 already instructs `taproot dod`, so no change needed there
- Tests are content-proxy checks (similar to status.md Parked section tests) — they verify the constraint content is present in implement.md, not runtime agent behaviour

## Source Files
- `.taproot/settings.yaml` — adds `check-if-affected-by: skill-architecture/commit-awareness` to `definitionOfDone`
- `skills/implement.md` — step 6: pre-commit context load (settings.yaml read, DoR, declaration commit classification); step 9: implementation commit classification and impl.md real-diff guidance
- `.taproot/skills/implement.md` — copy of skills/implement.md per CLAUDE.md rule

## Commits
- (run `taproot link-commits` to populate)
- `b3a3c806bbb38a053e1268e6fb9ea6bfc1b0127d` — (auto-linked by taproot link-commits)
- `66bec03cbe0534db95125f39ec514a7075a6ae77` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-proxy tests verifying implement.md contains: settings.yaml reference, declaration commit + DoR awareness, implementation commit + real-diff guidance

## Status
- **State:** complete
- **Created:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — changes are YAML config (.taproot/settings.yaml) and markdown skill files (skills/implement.md); no source code modified; no architectural constraints affected | resolved: 2026-03-20T20:00:00.000Z

## DoD Resolutions
- condition: document-current | note: README.md and docs/ do not need updating — commit-awareness is a new check-if-affected-by entry in settings.yaml; docs/configuration.md explains the check-if-affected-by mechanism generically and does not enumerate specific entries; no new CLI commands or configuration options introduced | resolved: 2026-03-20T19:18:02.904Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — commit-awareness enforcement uses the existing check-if-affected-by pattern already documented in docs/patterns.md; no new pattern to add | resolved: 2026-03-20T19:18:51.800Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot.yaml? | note: yes — this story introduces check-if-affected-by: skill-architecture/commit-awareness, which has been added to definitionOfDone in .taproot/settings.yaml | resolved: 2026-03-20T19:18:51.563Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — all changes are markdown (skills/implement.md) and YAML (.taproot/settings.yaml); no source code modified; no architectural constraints affected (filesystem as data model, no global state, no I/O outside command boundaries) | resolved: 2026-03-20T19:18:51.327Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that receive natural language descriptions and check docs/patterns.md; this implementation modifies settings.yaml and implement.md step content, not requirement-routing logic | resolved: 2026-03-20T19:18:51.091Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: compliant by definition — this implementation IS the commit-awareness enforcement. implement.md now has: C-1 (pre-commit context step reads settings.yaml, notes DoR runs via hook, instructs resolving agent-driven DoR conditions before staging); C-2 (declaration commit and implementation commit classifications surfaced); C-3 (impl.md real-diff requirement stated, DoD resolutions as the diff source explained). | resolved: 2026-03-20T19:18:50.853Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — changes are to skills/implement.md step content (steps 6 and 9). C-1: description unchanged (~50 tokens, compliant). C-2: no embedded docs. C-3: no cross-skill repetition. C-4: on-demand loading unchanged. C-5: /compact signal still present before What's next block. C-6: What's next block unchanged. | resolved: 2026-03-20T19:18:50.616Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to skills that write multiple documents in sequence; implement.md already complies (it pauses for plan approval before writing); the step additions do not introduce new multi-document sequences | resolved: 2026-03-20T19:18:03.845Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this implementation modifies settings.yaml and implement.md step content; contextual-next-steps applies to skills that produce primary output with a What's next block; implement.md already has a What's next block and it is unchanged | resolved: 2026-03-20T19:18:03.609Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md lists skills at a high level; the changes to implement.md are internal step additions, not new commands or skills to surface in the guide | resolved: 2026-03-20T19:18:03.374Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files from skills/ to agent adapter directories; the settings.yaml addition and implement.md content changes are not propagated via update.ts | resolved: 2026-03-20T19:18:03.142Z

