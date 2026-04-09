# Implementation: cli command

## Behaviour
../usecase.md

## Design Decisions
- Linked truth resolution integrated into `collectApplicableTruths` — same function used by both truth-sign and commithook, so linked truths automatically participate in session hashing without separate plumbing.
- Link files in global-truths detected by filename convention (`*-link.md` / `link.md`) then filtered by `Type: truth` — non-truth links are silently skipped, no extra configuration needed.
- Scope derived from source truth's filename (not link filename) — the source repo controls the scope signal, consistent with how local truths work.
- repos.yaml loaded lazily (only on first linked truth encounter) to avoid I/O when no truth links exist.
- Unresolvable linked truths included in the truth collection with `unresolvable: true` — commithook checks this flag and blocks the commit with a clear message. This avoids silent degradation.
- Offline mode (`TAPROOT_OFFLINE=1`) returns the link as unreadable (not unresolvable) — commithook emits a warning count but does not block.

## Source Files
- `src/core/truth-checker.ts` — `collectApplicableTruths` extended with `resolveLinkedTruth`; `TruthFile` interface extended with `linked`, `linkPath`, `unresolvable` fields
- `src/commands/commithook.ts` — linked truth enforcement: unresolvable blocks commit, offline emits warning

## Commits
- `f8519a2400896889f32e5eb269567e0d9faf65c4` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/truth-checker.test.ts` — AC-1: linked truth resolves and commit passes; AC-3: unresolvable blocks commit; AC-4: offline skips with warning; AC-5: no scope defaults to intent; unit tests for collectApplicableTruths with linked truths

## Status
- **State:** complete
- **Created:** 2026-04-03
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:37:34.222Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified; changes are in TypeScript source files only | resolved: 2026-04-03T06:46:02.200Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — cross-repo truth linking is already documented in docs/cross-repo.md and docs/patterns.md | resolved: 2026-04-03T06:46:01.900Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — linked truth enforcement is automatic (scans global-truths for link files); no settings.yaml entry needed | resolved: 2026-04-03T06:46:01.620Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — linked truth resolution follows same pattern as local truth collection; lazy repos.yaml loading avoids unnecessary I/O; no global state | resolved: 2026-04-03T06:46:01.316Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — commithook is infrastructure, not a skill that processes natural language | resolved: 2026-04-03T06:46:00.409Z

- condition: check-if-affected: examples/ | note: not applicable — linked truth enforcement is runtime commithook behaviour, not scaffolded in examples | resolved: 2026-04-03T06:37:51.830Z

- condition: check-if-affected: docs/ | note: docs/cross-repo.md already documents linked truth enforcement. No update needed. | resolved: 2026-04-03T06:37:51.498Z

- condition: check-if-affected: src/commands/update.ts | note: not applicable — no new skill files; changes are in truth-checker.ts and commithook.ts | resolved: 2026-04-03T06:37:51.214Z

- condition: check-if-affected: package.json | note: not applicable — no new dependencies; uses existing link-parser imports | resolved: 2026-04-03T06:37:50.893Z

- condition: document-current | note: Read docs/cross-repo.md: already documents linked truth enforcement at commit time (lines 147, 162-199). commithook error messages match documented behaviour. No docs update needed. | resolved: 2026-04-03T06:37:50.584Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:37:34.224Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:37:34.224Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:37:34.223Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:37:34.223Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:37:34.222Z

