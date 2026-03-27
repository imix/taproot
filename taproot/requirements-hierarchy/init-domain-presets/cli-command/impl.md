# Implementation: CLI Command — domain preset during init

## What
Extends `taproot init` with a domain preset step that writes `vocabulary` and `language` fields
to `.taproot/settings.yaml` — surfacing the settings system to developers who would not otherwise
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
- condition: quality-gates/architecture-compliance | note: All file writes in command boundary (src/commands/init.ts); DOMAIN_PRESETS is immutable constant; error messages are actionable (unknown preset lists valid options); no global mutable state introduced | resolved: 2026-03-27
- condition: quality-gates/nfr-measurability | note: not applicable — no NFR criteria in usecase.md | resolved: 2026-03-27

## DoD

| Criterion | Resolution |
|-----------|------------|
| Tests pass | 29/29 integration tests pass |
| Build passes | `tsc` clean |
| AC coverage | AC-2, AC-3, AC-4, AC-5, AC-7, AC-8, AC-10, AC-11, AC-12 covered by tests |

## Commits
<!-- taproot-managed -->

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last reviewed:** 2026-03-27
