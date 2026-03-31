# Implementation: validate-format extension

## Behaviour
../usecase.md

## Design Decisions
- Link file format validation added directly to `runValidateFormat()` as a second scan pass after the existing hierarchy marker scan. Keeps the command cohesive — one command validates all taproot-managed files.
- Link files are found using the existing `findLinkFiles()` from `link-parser.ts` (already used by check-orphans). No new scanner needed.
- Three new violation codes: `LINK_MISSING_FIELD` (Repo/Path/Type absent), `LINK_INVALID_TYPE` (Type not one of intent/behaviour/truth).
- `check-orphans` extended with `LINK_TARGET_DRAFT` warning: when a resolved target spec has state `proposed`, system warns but does not block (link file is accepted).
- Target state check reads only the first 30 lines of the resolved file to extract the `## Status` state cheaply — avoids parsing full specs in other repos.

## Source Files
- `src/commands/validate-format.ts` — extended to scan for link files and validate Repo/Path/Type fields
- `src/commands/check-orphans.ts` — extended to warn when resolved target spec is in proposed state

## Commits
- (placeholder)

## Tests
- `test/integration/cross-links.test.ts` — AC-1: valid link file passes validate-format; missing fields fail; invalid Type fails
- `test/integration/check-orphans.test.ts` — AC-6: resolved link pointing to proposed-state spec emits LINK_TARGET_DRAFT warning

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: validate-format extension uses findLinkFiles() from core module, receives path config from command boundary. No direct settings reads inside core logic. Compliant with build-time vs runtime config split. | resolved: 2026-03-31T15:57:37.283Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no NFR criteria on this usecase — format validation is correctness-only | resolved: 2026-03-31

## Status
- **State:** complete
- **Created:** 2026-03-31
- **Last verified:** 2026-03-31

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: validate-format extension uses findLinkFiles() from core module, receives path config from command boundary. No direct settings reads inside core logic. Compliant with build-time vs runtime config split. | resolved: 2026-03-31T15:58:00.000Z
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:58:38.076Z
- condition: check-if-affected: examples/ | note: no changes needed — no new example commands introduced | resolved: 2026-03-31T15:57:36.966Z

- condition: check-if-affected: docs/ | note: docs/cli.md updated with cross-repo link validation docs in cli-check-orphans impl | resolved: 2026-03-31T15:57:36.675Z

- condition: check-if-affected: src/commands/update.ts | note: no changes needed — validate-format extension does not affect the update command | resolved: 2026-03-31T15:57:36.407Z

- condition: check-if-affected: package.json | note: no changes needed — no new dependencies or scripts introduced | resolved: 2026-03-31T15:57:36.091Z

- condition: document-current | note: docs/cli.md updated in cli-check-orphans impl with cross-repo link validation section, repos.yaml format, and TAPROOT_OFFLINE note; validate-format link validation is part of the check-orphans docs update | resolved: 2026-03-31T15:57:35.830Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:56:56.151Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No new cross-cutting concern — link file format validation is specific to cross-repo-specification, not a generalizable concern for other implementations | resolved: 2026-03-31T15:56:55.884Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skill files in Source Files; auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:56:55.352Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution, file writes outside taproot/, or unsafe user input handling | note: No skill files modified — source files are src/commands/validate-format.ts and src/commands/check-orphans.ts | resolved: 2026-03-31T15:56:40.290Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No reusable pattern — validate-format extension is a one-off scan pass for link files, not a generalizable architectural pattern | resolved: 2026-03-31T15:56:35.037Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:58:38.079Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:58:38.079Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:58:38.078Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:58:38.078Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/commands/validate-format.ts, src/commands/check-orphans.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T15:58:38.077Z

