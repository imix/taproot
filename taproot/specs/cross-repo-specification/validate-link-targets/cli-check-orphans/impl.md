# Implementation: CLI check-orphans

## Behaviour
../usecase.md

## Design Decisions
- Link files are identified by filename: `link.md` (canonical) or any file matching `*-link.md` (descriptive variant). Scanned from all nodes in the flattened hierarchy tree.
- Link file fields (`Repo`, `Path`, `Type`) are parsed from markdown bold-label patterns: `**Repo:** <value>`. No YAML frontmatter required — consistent with taproot's markdown-first approach.
- `.taproot/repos.yaml` is loaded from the project root's `.taproot/` directory (same lookup pattern as settings.yaml). A flat YAML map of `<repo-url>: <local-path>`. Not committed (gitignored by design).
- `TAPROOT_OFFLINE=1` env var short-circuits all link resolution and emits a warning. Exits 0. Supports CI environments where repos.yaml cannot exist.
- `linkValidation: warn-only` in `taproot/settings.yaml` causes the pre-commit hook to print violations but not block the commit (warn mode).
- Cycle detection uses a `visited` set of absolute resolved paths. When following a link into a source repo, if that repo's hierarchy contains links that resolve to already-visited paths, a `LINK_CIRCULAR` violation is reported.
- Cycle detection is bounded to direct + one transitive level in v1 (following resolved source repo link files into their hierarchy). Full DAG traversal deferred to a future iteration.
- New violation codes: `LINK_TARGET_UNRESOLVABLE` (repos.yaml missing or URL not mapped), `LINK_TARGET_MISSING` (file not found at resolved path), `LINK_CIRCULAR` (cycle detected), `LINK_INVALID_FORMAT` (required fields absent).

## Source Files
- `src/core/link-parser.ts` — parse link.md files; load repos.yaml; resolve link targets; find link files in a directory tree
- `src/commands/check-orphans.ts` — extended with `checkLinkTargets()` integrating link validation into the existing orphan-check flow
- `src/commands/commithook.ts` — extended to call link validation with OFFLINE and warn-only support

## Commits
- (placeholder)
- `802bc75fe93d73dcf87c69f384468a76e2170df9` — (auto-linked by taproot link-commits)
- `d4c59c8a1675e322c2cf51a4ba05b52dca06a4f7` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/check-orphans.test.ts` — AC-1 (all resolve), AC-2 (target missing), AC-3 (repos.yaml absent), AC-4 (URL not mapped), AC-5 (circular reference), AC-7 (TAPROOT_OFFLINE=1); AC-6 (hook blocks commit) tested via commithook integration

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Architecture compliance verified: link-parser.ts is a pure core module with no settings.yaml reads; config passed as parameters from command boundary (check-orphans.ts and commithook.ts). Follows build-time vs runtime config split pattern from global-truths. | resolved: 2026-03-31T14:30:34.555Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: usecase has no NFR criteria — link validation is a correctness check, not a latency-sensitive operation | resolved: 2026-03-31

## Status
- **State:** complete
- **Created:** 2026-03-31
- **Last verified:** 2026-03-31

## DoD Resolutions
- condition: tests-passing | note: 1122/1122 tests pass (confirmed via npx vitest run). 10 new tests added for link validation covering AC-1 through AC-5 and AC-7. | resolved: 2026-03-31
- condition: document-current | note: docs/cli.md updated: added cross-repo link validation section to check-orphans entry documenting .taproot/repos.yaml format and TAPROOT_OFFLINE=1. README.md does not list individual CLI commands — no update needed. | resolved: 2026-03-31
- condition: check-if-affected: package.json | note: No new npm dependencies. js-yaml is already in dependencies. No package.json changes needed. | resolved: 2026-03-31
- condition: check-if-affected: src/commands/update.ts | note: update.ts copies skill files and docs to installed locations. link-parser.ts is a core module not installed as a skill — no update.ts changes needed. | resolved: 2026-03-31
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/core/link-parser.ts, src/commands/check-orphans.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T14:42:15.419Z
- condition: check-if-affected: docs/ | note: docs/cli.md updated with cross-repo link validation section for check-orphans. No other docs affected. | resolved: 2026-03-31
- condition: check-if-affected: examples/ | note: No examples reference check-orphans internals or link validation. No examples update needed. | resolved: 2026-03-31
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/core/link-parser.ts, src/commands/check-orphans.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T14:42:15.421Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/core/link-parser.ts, src/commands/check-orphans.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T14:42:15.421Z
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/core/link-parser.ts, src/commands/check-orphans.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T14:42:15.422Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/core/link-parser.ts, src/commands/check-orphans.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T14:42:15.422Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/core/link-parser.ts, src/commands/check-orphans.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T14:42:15.423Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: No skill files modified. Pattern-hints applies to skill interaction steps. Does not apply. | resolved: 2026-03-31
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Architecture compliance verified: link-parser.ts is a pure core module with no settings.yaml reads; config passed as parameters from command boundary. Follows build-time vs runtime config split pattern. | resolved: 2026-03-31
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: TAPROOT_OFFLINE=1 env var is a new project-wide convention but doesn't warrant a check-if-affected-by entry — no downstream skill or spec needs to enforce it. No settings.yaml update needed. | resolved: 2026-03-31
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: Cross-repo link validation is a project-specific feature, not a reusable agent pattern. No patterns.md entry warranted. | resolved: 2026-03-31
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: No skill files (skills/*.md) were modified in this implementation. Does not apply. | resolved: 2026-03-31
