# Implementation: CLI Command

## Behaviour
../usecase.md

## Design Decisions
- **Pack loading in command layer, not core** — `src/core/language.ts` contains pure logic only (substituteTokens, getLocalizedRequiredSections); file I/O for reading pack JSON happens in command handlers (`update.ts`, `validate-format.ts`, `commithook.ts`). This keeps core modules free of filesystem access, per the architecture constraint "External I/O only at command boundaries."
- **Pack path resolution via `import.meta.url`** — Pack files in `src/languages/` are compiled to `dist/languages/`. At runtime, resolved as `resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'languages', '<code>.json')`, matching the pattern used for `BUNDLED_SKILLS_DIR` in `init.ts`.
- **Language pack passed through function signatures** — Rather than loading from config inside validators, command entry points load the pack once and pass it as a parameter. No module-level caching — stateless per invocation.
- **`language` field added to `TaprootConfig`** — Optional `language?: string` in `src/validators/types.ts`; default is `undefined` (English). Command layer reads config, loads pack if configured, passes pack to validators.
- **impl.md sections excluded from localisation** — `Behaviour`, `Commits`, `Tests` are technical traceability fields; they are not in the language pack schema and validation for impl.md does not use the pack.
- **Runtime fallback on pack-not-found** — If the pack file cannot be resolved at runtime, validators fall back to English and emit a warning rather than crashing. This matches the alternate flow "Language pack missing a key" which also uses graceful fallback.

## Source Files
- `src/languages/en.json` — English identity pack (canonical key list)
- `src/languages/de.json` — German language pack
- `src/languages/fr.json` — French language pack
- `src/languages/es.json` — Spanish language pack
- `src/languages/ja.json` — Japanese language pack
- `src/languages/pt.json` — Portuguese language pack
- `src/core/language.ts` — `loadLanguagePack()`, `substituteTokens()`, `getLocalizedRequiredSections()`
- `src/validators/types.ts` — add `language?: string` to `TaprootConfig`
- `src/core/config.ts` — add `language` to DEFAULT_CONFIG
- `src/validators/format-rules.ts` — `checkRequiredSections` uses localised section names
- `src/commands/init.ts` — `installSkills()` accepts language pack, applies substitution
- `src/commands/update.ts` — load config + pack, pass to `installSkills()`
- `src/commands/commithook.ts` — pass language pack to quality checks; skip VERB_STARTS when pack is active
- `src/core/dor-runner.ts` — load language pack, resolve required section keys via pack before `parsed.sections.has()` lookup
- `src/adapters/index.ts` — `loadSkills()` applies substitution if language configured

## Commits
<!-- taproot-managed -->
- `6036170adf707ca0ec1c5e4eff94a47b9a90d8ea` — (auto-linked by taproot link-commits)
- `53240c89b8fba24f598c6d321359c1e6c3c361e7` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/language.test.ts` — loadLanguagePack (valid/invalid/missing), substituteTokens (single-pass, longest-key-first, case-sensitive), getLocalizedRequiredSections (all marker types, fallback on missing key)
- `test/integration/language-support.test.ts` — AC-1: update produces German skill files; AC-2: validate-format accepts German headers; AC-3: commithook accepts German usecase; AC-4: unknown language code aborts; AC-5: all five packs load and apply

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Pack I/O in command layer only; core/language.ts is pure logic; pack passed via function params — no violations of architectural constraints | resolved: 2026-03-23
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NFR-1 has measurable threshold "under 500ms" — compliant | resolved: 2026-03-23

## Status
- **State:** complete
- **Created:** 2026-03-23
- **Last verified:** 2026-03-24

## DoD Resolutions
- condition: document-current | note: Updated docs/configuration.md: added language: field to settings.yaml example, added ## Language section documenting all 5 supported codes, what gets localised, and the unknown-code abort behaviour | resolved: 2026-03-23T12:17:50.488Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the localizedSectionKey() helper is internal to dor-runner.ts; not a reusable pattern worth extracting. | resolved: 2026-03-24T17:01:14.510Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — bug fixes to three existing surfaces; no new cross-cutting pattern introduced. | resolved: 2026-03-24T17:01:14.271Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — localizedSectionKey() helper added to dor-runner.ts follows the same pure-logic pattern as language.ts. Pack I/O stays at command boundary (loadConfig/loadLanguagePack called inside runDorChecks, which is invoked from commithook.ts). No architectural constraint violated. | resolved: 2026-03-24T17:01:14.028Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T17:01:13.793Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T17:01:13.544Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T17:01:13.307Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no skill files created or modified; no document writes in CLI paths. | resolved: 2026-03-24T17:01:13.069Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — no skill files created or modified. | resolved: 2026-03-24T17:01:12.840Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — this implementation is source code only, no skill files created or modified. | resolved: 2026-03-24T17:01:12.606Z

- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED — guide.md describes workflow; no new commands or user-facing capabilities added. | resolved: 2026-03-24T17:01:12.365Z

- condition: check-if-affected: src/commands/update.ts | note: NOT AFFECTED — update.ts installs skills with pack substitution; the bug fixes are in quality-check logic only, no change to update flow. | resolved: 2026-03-24T17:01:12.121Z

- condition: document-current | note: NOT AFFECTED — no new CLI commands or config options. The bug fixes are internal to commithook.ts, dor-runner.ts, and format-rules.ts. docs/configuration.md language: section remains accurate. | resolved: 2026-03-24T17:01:11.875Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: STILL COMPLIANT — domain-vocabulary addition follows the same architecture: applyVocabulary() is pure logic in src/core/language.ts; vocabulary loading and validation at command boundaries in update.ts and adapters/index.ts. | resolved: 2026-03-24T13:11:53.170Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the language pack mechanism is specific to taproot's structural vocabulary substitution. It is not a general pattern applicable to other implementations in this codebase. | resolved: 2026-03-23T12:18:51.241Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — language substitution is self-contained and opt-in via settings.yaml language: field. It does not impose new structural requirements on every implementation. No new cross-cutting condition needed. | resolved: 2026-03-23T12:18:45.865Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — language.ts lives in src/core/ as pure logic (no I/O at module level). Pack file reads happen only at command boundaries (validate-format.ts, commithook.ts, update.ts, adapters/index.ts). Satisfies the architecture constraint: External I/O only at command boundaries. | resolved: 2026-03-23T12:18:38.117Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no new skills created. pattern-hints applies to skills that receive natural language intent from the developer. | resolved: 2026-03-23T12:18:32.185Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files created or modified. commit-awareness applies to skills that include git commit steps. | resolved: 2026-03-23T12:18:28.325Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — no skill files created or modified. context-engineering applies to skill .md files' size and focus constraints. | resolved: 2026-03-23T12:18:23.694Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no new skills are introduced. The pause-and-confirm behaviour applies to skills that write multiple documents; this implementation modifies CLI commands and core library logic. | resolved: 2026-03-23T12:18:17.468Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — this implementation adds a core library (language.ts) and modifies existing command internals. No new skill files are created. The contextual-next-steps behaviour applies to skills that produce output to the developer. | resolved: 2026-03-23T12:18:12.879Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — this implementation is source code (core library + command modifications), not a skill file. The agent-agnostic language behaviour applies to skill .md files and spec documents, not to TypeScript source. | resolved: 2026-03-23T12:18:08.432Z

- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED — guide.md describes workflow commands and the three-layer hierarchy. It does not document configuration options or language settings. No update needed. | resolved: 2026-03-23T12:18:03.390Z

- condition: check-if-affected: src/commands/update.ts | note: YES — modified: added language pack validation at start of runUpdate (aborts with error for unknown codes), loads pack and passes to installSkills(). Changes are complete. | resolved: 2026-03-23T12:17:58.425Z
- condition: verified-unaffected-by: agent-integration/generate-agent-adapter configuration-quick-ref addition | note: buildConfigQuickRef() addition to src/adapters/index.ts does not affect language substitution logic — language.ts and substituteTokens() are unchanged. Configuration Quick Reference content uses generic language with no pack-substitutable tokens. | resolved: 2026-03-24

