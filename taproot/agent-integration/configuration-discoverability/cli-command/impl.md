# Implementation: CLI Command — configuration discoverability

## Behaviour
../usecase.md

## Design Decisions
- CONFIGURATION.md content is generated from code (`buildConfigurationMd()` in `src/core/configuration.ts`) rather than a bundled static file — keeps it in sync with `DEFAULT_CONFIG`, supported language packs, and future settings additions without manual template maintenance
- `taproot update` writes CONFIGURATION.md after skills refresh — same flow that regenerates adapters and skills; no separate command needed
- CONFIGURATION.md is only written when at least one adapter is detected (consistent with the existing update guard) — avoids creating `.taproot/` in projects that have not run `taproot init`
- `taproot --help` footer uses `addHelpText('after', ...)` — commander's built-in mechanism; appears in both `taproot --help` and `taproot help` output without touching subcommand help
- This implementation also satisfies `update-adapters-and-skills` AC-6 and AC-7 (CONFIGURATION.md install and refresh) since both are served by the same `runUpdate` function

## Source Files
- `src/core/configuration.ts` — `buildConfigurationMd()`: generates the full `.taproot/CONFIGURATION.md` content documenting all settings.yaml options with examples and update-vs-runtime annotations
- `src/cli.ts` — adds `addHelpText('after', ...)` footer pointing to `.taproot/settings.yaml` and `.taproot/CONFIGURATION.md` (AC-2)
- `src/commands/update.ts` — calls `buildConfigurationMd()` and writes `.taproot/CONFIGURATION.md` after skills step (AC-6, AC-7 of update-adapters-and-skills)

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/configuration.test.ts` — covers: `buildConfigurationMd()` content (language, vocabulary, definitionOfDone, definitionOfReady, update-required annotations, examples); `taproot update` writes CONFIGURATION.md (AC-6); `taproot update` refreshes it on second run (AC-7); `taproot --help` footer contains settings.yaml and CONFIGURATION.md references (AC-2)

## Status
- **State:** in-progress
- **Created:** 2026-03-24

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — buildConfigurationMd() is pure logic in src/core/configuration.ts (no I/O). File writes happen only at the command boundary in update.ts. cli.ts change is addHelpText only. Follows established architecture: external I/O at command boundaries only. | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — this story introduces no measurable NFR. CONFIGURATION.md generation is synchronous string building; no performance threshold is specified or needed. | resolved: 2026-03-24
