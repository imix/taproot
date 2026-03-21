# Implementation: Validate UseCase Quality — Multi-Surface

## Behaviour
../usecase.md

## Design Decisions
- Quality checks run inside the existing requirement-tier block in `runCommithook` — no new tier needed
- Section extraction uses `content.split(/\n(?=## )/)` rather than regex lookaheads — avoids `\z` incompatibility in JS regex
- `checkUsecaseQuality` exported as a pure function for unit-testability independent of git
- Actor check targets the first non-empty line of `## Actor` only — avoids false positives from multi-line actor descriptions
- Agent context guidance added to CLAUDE.md so agents write compliant specs before the hook fires

## Source Files
- `src/commands/commithook.ts` — `checkUsecaseQuality`, `getSection`, spec failure integration in requirement tier
- `CLAUDE.md` — Writing usecase.md section

## Commits
- (to be filled)

## Tests
- `test/integration/commithook.test.ts` — `checkUsecaseQuality` unit describe block + `runCommithook — spec quality gates` integration describe

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this impl IS a quality gate; architecture-compliance checks whether other implementations conform to an architecture spec, but this impl adds a new gate, not an implementation of existing architecture | resolved: 2026-03-21T00:00:00.000Z

## DoD Resolutions
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: no commit step in this impl; gate enforcement is in commithook.ts invoked by the pre-commit hook, not a skill | resolved: 2026-03-21T00:00:00.000Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds spec quality checks to commithook.ts; tests cover all 6 ACs in validate-usecase-quality/usecase.md | resolved: 2026-03-21T00:00:00.000Z

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21
