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
- **Last verified:** 2026-03-19
