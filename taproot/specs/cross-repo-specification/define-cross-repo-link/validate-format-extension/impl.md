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
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: validate-format extension uses findLinkFiles() from core module, receives path config from command boundary. No direct settings reads inside core logic. Compliant with build-time vs runtime config split. | resolved: 2026-03-31
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no NFR criteria on this usecase — format validation is correctness-only | resolved: 2026-03-31

## Status
- **State:** in-progress
- **Created:** 2026-03-31
- **Last verified:** 2026-03-31
