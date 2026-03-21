# Implementation: CLI Command — taproot init --agent

## Behaviour
../usecase.md

## Design Decisions
- Each adapter generator is a standalone function — adding a new agent requires one new generator function plus an entry in `ALL_AGENTS`; no changes to the dispatch logic
- Claude adapter uses a "thin launcher" pattern: each `.claude/commands/tr-*.md` file contains only a brief prompt that instructs the agent to load the full skill from `taproot/skills/` — keeps adapters small and ensures skill updates flow through without regenerating adapters
- Copilot/Windsurf/generic adapters use `<!-- TAPROOT:START/END -->` markers for idempotent injection into potentially pre-existing files — preserves any non-taproot content in those files
- Skill descriptions (used in adapter indexes) are extracted from the first sentence of each skill's `## Description` section

## Source Files
- `src/adapters/index.ts` — all adapter generators (`generateClaudeAdapter`, `generateCursorAdapter`, `generateCopilotAdapter`, `generateWindsurfAdapter`, `generateGenericAdapter`)
- `src/commands/init.ts` — invokes `generateAdapters()` as part of `taproot init`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/adapters.test.ts` — covers adapter generation for all five agent types, idempotency, and marker-based injection
- `test/integration/init.test.ts` — covers adapter generation as part of full init flow

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-21

## DoD Resolutions
- condition: document-current | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:39.999Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:42.365Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:42.132Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.901Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.664Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.423Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:41.187Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.944Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.707Z

- condition: check-if-affected: skills/guide.md | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.468Z

- condition: check-if-affected: src/commands/update.ts | note: init.test.ts updated to add AC-9–12 tests for interactive init prompts. agent-adapter impl not affected — adapter generation logic and init.ts adapter path unchanged. | resolved: 2026-03-21T07:50:40.231Z

