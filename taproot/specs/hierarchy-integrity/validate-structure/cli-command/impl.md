# Implementation: CLI Command — taproot validate-structure

## Behaviour
../usecase.md

## Design Decisions
- Rule violations are typed as `error` or `warning` — only errors produce a non-zero exit code; warnings are informational
- Rules are implemented as pure functions in `structure-rules.ts` and composed in the command — makes individual rules unit-testable in isolation
- The `fs-walker` produces a typed tree with `marker` annotations (`intent`, `behaviour`, `impl`) so rules operate on semantically-typed nodes rather than raw filesystem paths

## Source Files
- `src/commands/validate-structure.ts` — CLI registration, orchestrates walking and rule application
- `src/validators/structure-rules.ts` — individual structure rule implementations
- `src/core/fs-walker.ts` — hierarchy walker that annotates nodes with intent/behaviour/impl markers
- `src/core/reporter.ts` — shared violation rendering and exit code logic

## Commits
- (run `taproot link-commits` to populate)
- `2e78c326d6083c6bbee635e412e491dfeb2eba40` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/validate-structure.test.ts` — end-to-end tests for valid and invalid hierarchies
- `test/unit/structure-rules.test.ts` — unit tests for individual rule functions

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: docs/ does not document the DEFAULT_EXCLUDE list in fs-walker.ts — it's an internal implementation detail. docs/cli.md describes validate-structure behaviour, not its exclusion list. docs/patterns.md: updated research/ path reference to taproot/research/ (example path was stale from the research folder move). README.md: does not enumerate walker exclusions. Docs are current. | resolved: 2026-03-29T21:12:44.480Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable — no skill files modified in this change. Only src/core/fs-walker.ts modified. | resolved: 2026-03-29T21:14:07.862Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — adding a folder name to an exclusion list is not a reusable pattern. No docs/patterns.md update needed. | resolved: 2026-03-29T21:14:07.597Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — adding 'research' to DEFAULT_EXCLUDE is a one-time fix for a specific folder type. It does not introduce a new cross-cutting concern applicable to future implementations. | resolved: 2026-03-29T21:14:07.328Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Reviewed docs/architecture.md. Change adds one string to DEFAULT_EXCLUDE set in fs-walker.ts — a pure additive change to an existing data structure. No new modules, no boundary crossings, no new commands. Filesystem-as-data-model preserved. Compliant. | resolved: 2026-03-29T21:14:07.052Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable — no new reusable patterns introduced. Adding a folder to an exclusion list is not a pattern. | resolved: 2026-03-29T21:13:52.608Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — no skill files modified. | resolved: 2026-03-29T21:13:52.340Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Not applicable — no skill files modified. | resolved: 2026-03-29T21:13:52.068Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable — no new multi-document skill operations introduced. TypeScript-only change. | resolved: 2026-03-29T21:13:51.793Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable — no new skills added, no new output-producing steps. Existing What's next? blocks unchanged. | resolved: 2026-03-29T21:13:51.525Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: TypeScript-only change to fs-walker.ts. No skill files, no docs modified (other than example path fix). No agent-specific language introduced. Compliant. | resolved: 2026-03-29T21:13:51.252Z

- condition: check-if-affected: examples/ | note: No new user workflows introduced. Adding research to DEFAULT_EXCLUDE is a structural fix — no example demonstrates the exclusion behaviour. examples/ unchanged. | resolved: 2026-03-29T21:13:37.763Z

- condition: check-if-affected: docs/ | note: docs/patterns.md: updated stale research/ path example to taproot/research/. No other docs/ files reference the DEFAULT_EXCLUDE list or folder structure of taproot/research/. Docs updated and current. | resolved: 2026-03-29T21:13:37.503Z

- condition: check-if-affected: skills/guide.md | note: No new user-facing slash commands. skills/guide.md unchanged. | resolved: 2026-03-29T21:13:15.200Z

- condition: check-if-affected: src/commands/update.ts | note: No new skill files registered, no new commands added. update.ts unchanged. | resolved: 2026-03-29T21:13:14.917Z

- condition: check-if-affected: package.json | note: One-line addition to DEFAULT_EXCLUDE set in fs-walker.ts. No new dependencies, no new CLI commands, no version bump. package.json unchanged. | resolved: 2026-03-29T21:13:14.650Z

