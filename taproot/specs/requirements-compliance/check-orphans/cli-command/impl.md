# Implementation: CLI Command — taproot check-orphans

## Behaviour
../usecase.md

## Design Decisions
- Behaviour reference checking resolves the path relative to the `impl.md` file — matches the `../usecase.md` convention used by all impl.md files
- Source file path resolution handles two cases: relative paths (resolved from the impl folder) and project-root-relative paths (e.g. `src/foo.ts`) — mirrors how developers naturally write paths in impl.md
- `--include-unimplemented` is opt-in rather than default to avoid noise in early-stage projects where many behaviours are intentionally not yet implemented

## Source Files
- `src/commands/check-orphans.ts` — reference checking, violation collection, CLI registration
- `src/core/impl-reader.ts` — parses `impl.md` to extract behaviour refs, source files, test files, and commits
- `src/core/reporter.ts` — shared violation rendering and exit code logic

## Commits
- `328369ca537e3c5ed2692369ca3fe81c56d41c1c` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/check-orphans.test.ts` — covers broken behaviour refs, missing source/test files, invalid commits, and unimplemented behaviour detection

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: NO UPDATE NEEDED — docs/configuration.md and README document user-facing CLI behaviour (commands, flags, output). The path-token recognition fix is an internal parsing detail in impl-reader.ts with no change to CLI interface, flags, or user-visible output format. | resolved: 2026-03-24T13:38:41.663Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the isFilePath heuristic is specific to impl.md parsing. Not a general-purpose pattern. | resolved: 2026-03-24T13:39:26.126Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — path-token recognition is specific to impl-reader.ts parsing. Not a cross-cutting concern affecting other implementations. | resolved: 2026-03-24T13:39:24.820Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — isFilePath() and extractFilePaths() are pure logic in src/core/impl-reader.ts (no I/O). No architectural constraint violated. | resolved: 2026-03-24T13:39:23.576Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no new skills created. pattern-hints applies to skills that receive natural language intent. | resolved: 2026-03-24T13:39:15.560Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T13:39:14.288Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T13:39:13.032Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no new skills created. pause-and-confirm applies to skills that write multiple documents. | resolved: 2026-03-24T13:39:04.192Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — no new skills created. contextual-next-steps applies to skills that produce output to the developer. | resolved: 2026-03-24T13:39:02.976Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — no skill files or spec documents created. agent-agnostic-language applies to skill .md files and spec documents, not TypeScript source. | resolved: 2026-03-24T13:39:01.776Z

- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED — guide.md documents the taproot workflow and skill commands. Internal impl-reader.ts parsing logic is not surfaced in the guide. | resolved: 2026-03-24T13:38:52.117Z

- condition: check-if-affected: src/commands/update.ts | note: NOT AFFECTED — update.ts handles taproot update (skill installation, language pack, vocabulary). No connection to check-orphans path parsing. | resolved: 2026-03-24T13:38:50.876Z

