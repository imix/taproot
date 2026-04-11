# Implementation: Validate UseCase Quality — Multi-Surface

## Behaviour
../usecase.md

## Design Decisions
- Quality checks run inside the existing requirement-tier block in `runCommithook` — no new tier needed
- Section extraction uses `content.split(/\n(?=## )/)` rather than regex lookaheads — avoids `\z` incompatibility in JS regex
- `checkUsecaseQuality` exported as a pure function for unit-testability independent of git
- Actor check targets the first non-empty line of `## Actor` only — avoids false positives from multi-line actor descriptions
- Agent context guidance added to CLAUDE.md so agents write compliant specs before the hook fires
- AC-7 (tech-term check in Acceptance Criteria): uses same `TECH_KEYWORDS` regex as Main Flow, Postconditions, and Alternate Flows checks; checks all non-empty lines in the AC section; breaks on first match to report one actionable failure at a time; guarded by `!pack` (same pattern as other section checks) so it does not fire in localised contexts

## Source Files
- `src/commands/commithook.ts` — `checkUsecaseQuality`, `getSection`, spec failure integration in requirement tier
- `CLAUDE.md` — Writing usecase.md section

## Commits
- (to be filled)
- `f3e8207a6314ac256f9fc97c664127c68ef09d37` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — `checkUsecaseQuality` unit describe block + `runCommithook — spec quality gates` integration describe

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this impl IS a quality gate; architecture-compliance checks whether other implementations conform to an architecture spec, but this impl adds a new gate, not an implementation of existing architecture | resolved: 2026-03-21T00:00:00.000Z

## DoD Resolutions
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: no commit step in this impl; gate enforcement is in commithook.ts invoked by the pre-commit hook, not a skill | resolved: 2026-03-21T00:00:00.000Z
- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: not applicable — source files are commithook.ts (a TypeScript git hook) and CLAUDE.md; no skill file modified; portable-output-patterns governs skill files (skills/*.md) only | resolved: 2026-04-11T07:13:45.593Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — skills/behaviour.md and skills/intent.md updated with guidance notes only (no shell commands, no credentials, no executable instructions). skills/define-truth.md updated with concrete naming examples (glossary_intent.md, intent/glossary.md) — purely illustrative text. All changes follow least-privilege. | resolved: 2026-04-01T16:39:57.387Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — the Main Flow implementation-terms check is part of the existing validate-usecase-quality gate, not a new cross-cutting concern. It extends checkUsecaseQuality in commithook.ts. No new settings.yaml entry needed. | resolved: 2026-04-01T16:39:50.633Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Not applicable — commithook.ts is TypeScript source code (a git hook), not a skill file. The agent-agnostic-language behaviour applies to skills/*.md files. No agent-specific syntax introduced. | resolved: 2026-04-01T16:39:43.155Z

- condition: check-if-affected: examples/ | note: NOT AFFECTED — starter examples scaffold spec hierarchy structure; they do not demonstrate commithook enforcement logic or Main Flow quality rules. | resolved: 2026-04-01T16:39:37.771Z

- condition: check-if-affected: docs/ | note: docs/concepts.md updated with the Why/What/How rule callout block and updated Main Flow bullet to describe actor-visible language. This is the doc-layer enforcement of the same constraint the hook now enforces at commit time. | resolved: 2026-04-01T16:39:33.354Z

- condition: check-if-affected: package.json | note: No new CLI commands or npm dependencies added. commithook.ts change adds a Main Flow check to checkUsecaseQuality (pure logic). package.json unchanged. | resolved: 2026-04-01T16:39:26.702Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — spec quality checks are part of the existing commithook requirement tier; no new check-if-affected-by needed | resolved: 2026-03-21T06:36:49.895Z

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
- **Last verified:** 2026-04-09
