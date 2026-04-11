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
- condition: check-if-affected: package.json | note: not affected — no new CLI commands, no new npm dependencies; up-contamination warning is internal hook logic in commithook.ts | resolved: 2026-04-11T06:36:22.614Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: not applicable — implementation is TypeScript source and tests; portable-output-patterns governs skill files (skills/*.md); no skill file modified | resolved: 2026-04-11T06:36:10.793Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill file modified; changes are in commithook.ts (TypeScript) and test/integration/commithook.test.ts only | resolved: 2026-04-11T06:36:10.505Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — up-contamination warning is specific to validate-intent-quality; no new architectural constraint that other implementations must conform to | resolved: 2026-04-11T06:36:10.228Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — implementation is TypeScript source (commithook.ts) and tests; no skill file modified; agent-agnostic-language governs shared skill files | resolved: 2026-04-11T06:36:09.958Z

- condition: check-if-affected: examples/ | note: not affected — examples demonstrate hierarchy structure and plan.md format; commithook output is runtime behaviour not illustrated in examples/ | resolved: 2026-04-11T06:36:09.690Z

- condition: check-if-affected: docs/ | note: updated docs/cli.md table row for hierarchy-file requirement commits — added 'Success Criteria tech-term check' and 'up-contamination warning (non-blocking)' to the spec quality checks description | resolved: 2026-04-11T06:35:57.925Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — getSection() helper is internal to commithook.ts; VERB_STARTS and TECH_KEYWORDS are implementation-specific constants not reusable as general patterns | resolved: 2026-03-21T06:37:55.067Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — spec quality checks are part of the existing commithook requirement tier; no new check-if-affected-by needed | resolved: 2026-03-21T06:37:54.835Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills routing natural language requests; commithook.ts is a git hook | resolved: 2026-03-21T06:37:54.606Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill file design; this is TypeScript source code | resolved: 2026-03-21T06:37:54.377Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — commithook.ts is a git hook, not a multi-document-authoring skill | resolved: 2026-03-21T06:37:54.145Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — commithook.ts is a git hook with no What's next block | resolved: 2026-03-21T06:37:53.916Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md documents user-facing skills; validate-intent-quality is a pre-commit gate, not a user-facing skill | resolved: 2026-03-21T06:37:53.682Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files; quality gate logic is in commithook.ts and not distributed via taproot update | resolved: 2026-03-21T06:37:53.447Z

- condition: document-current | note: commithook.ts is an internal hook; docs/cli.md already documents taproot commithook; spec quality checks are not new CLI commands or config options requiring documentation | resolved: 2026-03-21T06:37:53.210Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds intent quality checks to commithook.ts; tests cover all 6 ACs in validate-intent-quality/usecase.md | resolved: 2026-03-21T06:30:00.000Z

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-04-09
