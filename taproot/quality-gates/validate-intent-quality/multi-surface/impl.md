# Implementation: Validate Intent Quality — Multi-Surface

## Behaviour
../usecase.md

## Design Decisions
- Quality checks run inside the existing requirement-tier block in `runCommithook` — same loop as usecase checks
- `checkIntentQuality` exported as a pure function for unit-testability
- Verb-start check uses an explicit allowlist (`VERB_STARTS`) rather than POS tagging — deterministic, CI-safe
- Tech keyword check (`TECH_KEYWORDS`) targets the first line of `## Goal` only to avoid false positives in notes
- Agent context guidance added to CLAUDE.md so agents write compliant intents before the hook fires

## Source Files
- `src/commands/commithook.ts` — `checkIntentQuality`, `VERB_STARTS`, `TECH_KEYWORDS`, spec failure integration in requirement tier
- `CLAUDE.md` — Writing intent.md section

## Commits
- (to be filled)

## Tests
- `test/integration/commithook.test.ts` — `checkIntentQuality` unit describe block + `runCommithook — spec quality gates` integration describe

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this impl IS a quality gate; architecture-compliance checks whether other implementations conform to an architecture spec, but this impl adds a new gate, not an implementation of existing architecture | resolved: 2026-03-21T00:00:00.000Z

## DoD Resolutions
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: no commit step in this impl; gate enforcement is in commithook.ts invoked by the pre-commit hook, not a skill | resolved: 2026-03-21T00:00:00.000Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds intent quality checks to commithook.ts; tests cover all 6 ACs in validate-intent-quality/usecase.md | resolved: 2026-03-21T00:00:00.000Z

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21
