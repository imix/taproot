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

## Tests
- `test/unit/skills.test.ts` — AC-proxy tests verifying implement.md contains: settings.yaml reference, declaration commit + DoR awareness, implementation commit + real-diff guidance

## Status
- **State:** in-progress
- **Created:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — changes are YAML config (.taproot/settings.yaml) and markdown skill files (skills/implement.md); no source code modified; no architectural constraints affected | resolved: 2026-03-20T20:00:00.000Z

## DoD Resolutions
