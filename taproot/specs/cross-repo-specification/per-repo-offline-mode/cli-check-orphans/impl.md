# Implementation: CLI check-orphans Extension

## Behaviour
../usecase.md

## Design Decisions
- `offline` sentinel stored as literal string in the repos map — `loadReposYaml` preserves the string `'offline'` without path-resolving it; all other values are still resolved to absolute paths via `resolve(projectRoot, localPath)`
- `isOfflineRepo()` helper exported from `link-parser.ts` — check is centralised and usable from both `check-orphans.ts` and `truth-checker.ts` without duplicating the sentinel string
- `resolveLinkTarget` returns `null` for `offline` repos — callers already handle `null`; the offline guard in `checkLinkTargets` runs before `resolveLinkTarget` to emit the per-link warning before the generic "not in map" error path
- Transitive traversal skips offline repos — the `sourceRepoRoot !== 'offline'` guard in the cycle-detection block prevents attempting `existsSync('offline')`
- `truth-checker.ts` treats offline linked truths as `unreadable: true` — same semantics as global `TAPROOT_OFFLINE=1` for that specific link; truth content is not available but the link entry is preserved in results

## Source Files
- `src/core/link-parser.ts` — `loadReposYaml` (offline sentinel), `resolveLinkTarget` (offline guard), `isOfflineRepo` (new helper)
- `src/commands/check-orphans.ts` — `checkLinkTargets` (per-repo offline skip with warning, transitive traversal guard)
- `src/core/truth-checker.ts` — `resolveLinkedTruth` (per-repo offline fallback)

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/check-orphans.test.ts` — AC-1 (offline repo emits warning, no error), AC-2 (mixed offline/local repos), AC-3 (TAPROOT_OFFLINE=1 overrides per-repo entries)

## Status
- **State:** in-progress
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — extends existing link-parser and check-orphans infrastructure; no new architectural patterns; offline sentinel is a data value, not a structural pattern | resolved: 2026-04-09
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — AC-1 measurable (warning emitted, no error); AC-2 testable (mixed offline/local map); AC-3 testable (TAPROOT_OFFLINE=1 overrides) | resolved: 2026-04-09

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this implementation extends existing link-parser and check-orphans infrastructure; no new architectural patterns introduced; the offline sentinel is a data value, not a structural pattern | resolved: 2026-04-09T08:52:56.984Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — AC-1 is measurable (warning emitted, no error); AC-2 is testable (mixed map with both offline and local entries); AC-3 is testable (TAPROOT_OFFLINE=1 overrides) | resolved: 2026-04-09T08:52:57.283Z

