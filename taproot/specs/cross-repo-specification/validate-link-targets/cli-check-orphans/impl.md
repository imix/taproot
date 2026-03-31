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

## Tests
- `test/integration/check-orphans.test.ts` — AC-1 (all resolve), AC-2 (target missing), AC-3 (repos.yaml absent), AC-4 (URL not mapped), AC-5 (circular reference), AC-7 (TAPROOT_OFFLINE=1); AC-6 (hook blocks commit) tested via commithook integration

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: link-parser.ts is a pure core module with no settings reads; config (repos.yaml path) passed as parameter from command boundary — consistent with build-time vs runtime config split pattern | resolved: 2026-03-31
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: usecase has no NFR criteria — link validation is a correctness check, not a latency-sensitive operation | resolved: 2026-03-31

## Status
- **State:** in-progress
- **Created:** 2026-03-31
- **Last verified:** 2026-03-31
