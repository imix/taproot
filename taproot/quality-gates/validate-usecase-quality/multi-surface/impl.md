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
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — spec quality checks are part of the existing commithook requirement tier; no new check-if-affected-by needed | resolved: 2026-03-21T06:36:49.895Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills routing natural language requests; commithook.ts is a git hook | resolved: 2026-03-21T06:36:49.658Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill file design; this is TypeScript source code | resolved: 2026-03-21T06:36:49.413Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — commithook.ts is a git hook, not a multi-document-authoring skill | resolved: 2026-03-21T06:36:49.180Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — commithook.ts is a git hook with no What's next block | resolved: 2026-03-21T06:36:48.939Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md documents user-facing skills; validate-usecase-quality is a pre-commit gate, not a user-facing skill | resolved: 2026-03-21T06:36:48.700Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files; quality gate logic is in commithook.ts and not distributed via taproot update | resolved: 2026-03-21T06:36:48.456Z

- condition: document-current | note: commithook.ts is an internal hook; docs/cli.md already documents taproot commithook; spec quality checks are not new CLI commands or config options requiring documentation | resolved: 2026-03-21T06:36:29.779Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — getSection() is internal to commithook.ts; spec quality checks use established heuristic patterns already described in usecase.md | resolved: 2026-03-21T06:36:12.555Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds spec quality checks to commithook.ts; tests cover all 6 ACs in validate-usecase-quality/usecase.md | resolved: 2026-03-21T06:30:00.000Z

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21
