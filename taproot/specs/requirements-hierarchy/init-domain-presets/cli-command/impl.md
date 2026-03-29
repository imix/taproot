# Implementation: CLI Command — domain preset during init

## What
Extends `taproot init` with a domain preset step that writes `vocabulary` and `language` fields
to `taproot/settings.yaml` — surfacing the settings system to developers who would not otherwise
know it exists.

## Where
- `src/commands/init.ts` — `DOMAIN_PRESETS`, `AVAILABLE_PRESETS`, extended `runInit`, `registerInit`
- `test/integration/init.test.ts` — preset AC tests (AC-2 through AC-12)

## Behaviour
../usecase.md

## Tests
- `test/integration/init.test.ts` — 29 integration tests including AC-2 through AC-12 preset coverage

## Key Decisions
- `noUncheckedIndexedAccess` in tsconfig requires `null`-check before accessing `DOMAIN_PRESETS[key].vocabulary`
- Idempotency: if `vocabulary` already exists in `settings.yaml`, preset prompt is skipped and existing block is preserved
- Language prompt is always shown on first run (even if coding/default was selected)
- Vocabulary is written at settings.yaml creation time for fresh inits; appended via yaml parse+rewrite for existing files
- `taproot update` reminder appended to output when vocabulary or language was applied

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: All file writes in command boundary (src/commands/init.ts); DOMAIN_PRESETS is immutable constant; error messages are actionable (unknown preset lists valid options); no global mutable state introduced | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR criteria in usecase.md | resolved: 2026-03-27

## DoD

| Criterion | Resolution |
|-----------|------------|
| Tests pass | 29/29 integration tests pass |
| Build passes | `tsc` clean |
| AC coverage | AC-2, AC-3, AC-4, AC-5, AC-7, AC-8, AC-10, AC-11, AC-12 covered by tests |

## Commits
<!-- taproot-managed -->
- `c6c2ab1dd4ed7c4a9657e8a750192b149ece4cd8` — (auto-linked by taproot link-commits)

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last reviewed:** 2026-03-27

## DoD Resolutions
- condition: document-current | note: README.md does not document individual CLI flags (by design — only quick-start usage shown). docs/configuration.md already fully documents vocabulary and language settings. The --preset flag is a convenience UI for those settings; no doc update needed. | resolved: 2026-03-27T10:11:01.817Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No new cross-cutting concern — this is a removal of content-domain presets (blogging, book-authoring) that were a poor fit for taproot's software traceability model. | resolved: 2026-03-29T09:00:49.262Z

- condition: check-if-affected: package.json | note: Removed blogging and book-authoring presets — no dependency changes, no version bump needed. | resolved: 2026-03-29T09:00:49.011Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: No skill files were modified. Not applicable. | resolved: 2026-03-27T10:17:26.726Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No reusable pattern. Domain preset is a specific UX feature of taproot init, not a general pattern applicable to other implementations. | resolved: 2026-03-27T10:17:25.426Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No new cross-cutting concern. Domain preset writes to settings.yaml at init time — it is a one-time setup concern, not a pattern that should be checked on every implementation commit. | resolved: 2026-03-27T10:16:43.873Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant: all file writes in command boundary (src/commands/init.ts); DOMAIN_PRESETS is an immutable constant; error messages are actionable (unknown preset error lists valid options); no global mutable state; no raw exceptions to user. | resolved: 2026-03-27T10:16:42.578Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Applies to skills processing user-expressed needs. No skill file was modified. Not applicable. | resolved: 2026-03-27T10:16:08.683Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Applies to skill files containing commit steps. No skill file was modified. Not applicable. | resolved: 2026-03-27T10:16:07.332Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Applies to skill files (skills/*.md). No skill file was modified. Not applicable. | resolved: 2026-03-27T10:16:05.957Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Applies to skills writing multiple documents in sequence. taproot init is a CLI command that writes config, not a bulk-document skill. Not applicable. | resolved: 2026-03-27T10:13:58.152Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Applies to taproot skills that produce primary output. taproot init is a CLI command, not a skill. Not applicable. | resolved: 2026-03-27T10:13:56.849Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: No skill files or shared spec files were modified. impl.md uses generic language. Not applicable. | resolved: 2026-03-27T10:13:55.550Z

- condition: check-if-affected: examples/ | note: No examples use domain-specific vocabulary. Existing examples (webapp, book-authoring, cli-tool) can be used with or without presets. No update needed. | resolved: 2026-03-27T10:11:19.211Z

- condition: check-if-affected: docs/ | note: docs/configuration.md already fully documents vocabulary and language settings (sections at lines 245 and 273). The --preset flag is a UI shortcut to those settings, not a new setting requiring documentation. | resolved: 2026-03-27T10:11:17.963Z

- condition: check-if-affected: skills/guide.md | note: guide.md covers the init workflow at a high level. Domain preset is an optional refinement step — not a mandatory workflow step that needs to be surfaced in onboarding guidance. | resolved: 2026-03-27T10:11:10.196Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts already reads vocabulary and language from settings.yaml (lines 252-282) and applies them during taproot update. No changes required. | resolved: 2026-03-27T10:11:08.887Z

