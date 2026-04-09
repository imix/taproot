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
- **State:** complete
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — extends existing link-parser/check-orphans patterns; offline sentinel is a string value handled in existing map iteration; isOfflineRepo() helper follows existing function conventions in link-parser.ts | resolved: 2026-04-09T08:53:27.240Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — AC-1/AC-2/AC-3 are all testable with concrete inputs/outputs; 3 integration tests cover each criterion | resolved: 2026-04-09T08:53:27.242Z

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this implementation extends existing link-parser and check-orphans infrastructure; no new architectural patterns introduced; the offline sentinel is a data value, not a structural pattern | resolved: 2026-04-09T08:52:56.984Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — per-repo offline mode is additive to existing link validation; no new cross-cutting enforcement concern | resolved: 2026-04-09T08:53:40.493Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the offline sentinel pattern is specific to the repos.yaml configuration; insufficient generality for a new pattern entry | resolved: 2026-04-09T08:53:40.492Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified | resolved: 2026-04-09T08:53:40.491Z

- condition: check-if-affected-by: taproot-distribution/vscode-marketplace | note: not applicable — this is a CLI/core extension, not a VS Code extension change | resolved: 2026-04-09T08:53:40.491Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill files modified; pattern-hints applies to skills that route user requests | resolved: 2026-04-09T08:53:40.490Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skill files modified | resolved: 2026-04-09T08:53:40.490Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified | resolved: 2026-04-09T08:53:40.489Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no interactive agent skill; check-orphans is a non-interactive CLI command | resolved: 2026-04-09T08:53:40.489Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no agent skill interaction surface; this is a CLI/hook extension | resolved: 2026-04-09T08:53:40.488Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skill files modified | resolved: 2026-04-09T08:53:40.486Z

- condition: check-if-affected: examples/ | note: not affected — no new examples warranted; the feature is additive to existing repos.yaml format | resolved: 2026-04-09T08:53:27.244Z

- condition: check-if-affected: docs/ | note: not affected — docs/ covers agent setup and configuration concepts; the repos.yaml.example file documents the offline: syntax adequately | resolved: 2026-04-09T08:53:27.244Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers onboarding workflow; per-repo offline mode is an advanced cross-repo config option not covered in onboarding | resolved: 2026-04-09T08:53:27.244Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update command regenerates adapter files; link-parser and check-orphans are not part of that flow | resolved: 2026-04-09T08:53:27.243Z

- condition: check-if-affected: package.json | note: not affected — no new dependencies; extends existing js-yaml and fs usage | resolved: 2026-04-09T08:53:27.243Z

- condition: document-current | note: no docs updates needed — offline: value behaviour is self-documenting via the repos.yaml.example file and the spec itself; no new CLI flags or commands added | resolved: 2026-04-09T08:53:27.242Z

- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — AC-1 is measurable (warning emitted, no error); AC-2 is testable (mixed map with both offline and local entries); AC-3 is testable (TAPROOT_OFFLINE=1 overrides) | resolved: 2026-04-09T08:52:57.283Z

