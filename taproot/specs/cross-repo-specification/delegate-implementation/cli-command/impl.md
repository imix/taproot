# Implementation: cli command

## Behaviour
../usecase.md

## Design Decisions
- `delegated` counted alongside `complete` in `completeCount` — a delegated impl represents a positive coverage signal, same as complete, just implemented elsewhere.
- `collectIncomplete()` excludes `delegated` using the same pattern as `deferred` — both are terminal states that should not block release preflight.
- AC-1 (validate-format) requires no code change — `delegated` was already in `allowed_impl_states` in settings.yaml.
- AC-4 (naming convention) is a documentation/convention concern — enforced by the usecase spec itself, not by code.

## Source Files
- `src/commands/coverage.ts` — `completeCount` increment (line ~135) and `collectIncomplete` exclusion (line ~595)

## Commits

## Tests
- `test/integration/coverage.test.ts` — AC-2: delegated + complete counted as accounted; AC-3: fully-delegated not a gap; collectIncomplete excludes delegated

## Status
- **State:** complete
- **Created:** 2026-04-02
- **Last verified:** 2026-04-02

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-02T21:26:52.004Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified; change is in src/commands/coverage.ts only | resolved: 2026-04-02T21:33:24.522Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the delegated impl pattern is already documented in docs/cross-repo.md and docs/patterns.md (cross-repo change handoff section) | resolved: 2026-04-02T21:33:24.255Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — delegated is a new impl state value handled by existing coverage logic; no cross-cutting enforcement needed | resolved: 2026-04-02T21:33:23.979Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: two-line change adds delegated to existing state checks — follows same pattern as deferred. No architectural decisions. Compliant. | resolved: 2026-04-02T21:32:00.895Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — coverage.ts is a CLI command, not a skill that receives natural language input for pattern matching | resolved: 2026-04-02T21:32:00.628Z

- condition: check-if-affected: examples/ | note: not applicable — no new CLI command or workflow pattern; internal logic change only | resolved: 2026-04-02T21:32:00.361Z

- condition: check-if-affected: docs/ | note: docs/cross-repo.md already documents delegated state and coverage counting — no update needed | resolved: 2026-04-02T21:32:00.087Z

- condition: check-if-affected: src/commands/update.ts | note: not applicable — no new skill files added; coverage.ts is not related to update.ts | resolved: 2026-04-02T21:31:59.826Z

- condition: check-if-affected: package.json | note: not applicable — no new dependencies or CLI commands added; two-line logic change in existing coverage.ts | resolved: 2026-04-02T21:31:59.555Z

- condition: document-current | note: Read docs/cross-repo.md and docs/cli.md: delegated state already fully documented (cross-repo.md lines 42-202 cover delegated impls, coverage counting, examples). This change makes coverage.ts match the documented behaviour. No new docs needed. | resolved: 2026-04-02T21:27:07.755Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-02T21:26:52.006Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-02T21:26:52.006Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-02T21:26:52.006Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-02T21:26:52.005Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-02T21:26:52.005Z

