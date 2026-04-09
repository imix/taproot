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
- `src/cli.ts` — adds `addHelpText('after', ...)` footer pointing to `taproot/settings.yaml` and `.taproot/CONFIGURATION.md` (AC-2)
- `src/commands/update.ts` — calls `buildConfigurationMd()` and writes `.taproot/CONFIGURATION.md` after skills step (AC-6, AC-7 of update-adapters-and-skills)

## Commits
- (run `taproot link-commits` to populate)
- `c24280dc5473ee636a5fe5c19fb93298f00c5814` — (auto-linked by taproot link-commits)
- `497bb29339f3f330eb4422ba8cfa1a2a0da4483f` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/configuration.test.ts` — covers: `buildConfigurationMd()` content (language, vocabulary, definitionOfDone, definitionOfReady, update-required annotations, examples); `taproot update` writes CONFIGURATION.md (AC-6); `taproot update` refreshes it on second run (AC-7); `taproot --help` footer contains settings.yaml and CONFIGURATION.md references (AC-2)

## Status
- **State:** complete
- **Created:** 2026-03-24
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — buildConfigurationMd() is pure logic in src/core/configuration.ts (no I/O). File writes happen only at the command boundary in update.ts. cli.ts change is addHelpText only. Follows established architecture: external I/O at command boundaries only. | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — this story introduces no measurable NFR. CONFIGURATION.md generation is synchronous string building; no performance threshold is specified or needed. | resolved: 2026-03-24

## DoD Resolutions
- condition: document-current | note: UPDATED docs/configuration.md: added Quick discovery section documenting .taproot/CONFIGURATION.md (installed by taproot update) and the taproot --help footer as the primary configuration discovery surfaces. | resolved: 2026-03-24T15:06:49.570Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — straightforward file generation and installation. Not a general pattern. | resolved: 2026-03-24T15:07:24.686Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — CONFIGURATION.md installation is specific to taproot update. No cross-cutting concern affecting other implementations. | resolved: 2026-03-24T15:07:24.448Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — buildConfigurationMd() is pure logic in src/core/configuration.ts (no I/O). File writes happen only at the command boundary in update.ts. cli.ts change is addHelpText only. | resolved: 2026-03-24T15:07:24.211Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no new skills created. pattern-hints applies to skills that receive natural language intent. | resolved: 2026-03-24T15:07:15.145Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T15:07:14.912Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T15:07:14.677Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no new skills created. pause-and-confirm applies to skills that write multiple documents. | resolved: 2026-03-24T15:07:14.433Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — no new skills created. contextual-next-steps applies to skills that produce output to the developer. | resolved: 2026-03-24T15:07:14.196Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — src/core/configuration.ts is TypeScript source, not a skill file. The generated CONFIGURATION.md uses generic language only (no agent-specific names). The agent-agnostic-language standard applies to skill .md files and spec documents. | resolved: 2026-03-24T15:07:04.049Z

- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED — guide.md documents the taproot workflow and skill commands. The --help footer and CONFIGURATION.md installation are internal CLI changes not surfaced in the skill guide. | resolved: 2026-03-24T15:06:57.693Z

- condition: check-if-affected: src/commands/update.ts | note: YES — modified: added import of buildConfigurationMd() and call to write .taproot/CONFIGURATION.md after skills refresh step. Changes are complete. | resolved: 2026-03-24T15:06:57.456Z

