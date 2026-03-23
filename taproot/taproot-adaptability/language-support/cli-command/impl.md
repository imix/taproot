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
- `src/commands/commithook.ts` — pass language pack to quality checks
- `src/adapters/index.ts` — `loadSkills()` applies substitution if language configured

## Commits
<!-- taproot-managed -->

## Tests
- `test/unit/language.test.ts` — loadLanguagePack (valid/invalid/missing), substituteTokens (single-pass, longest-key-first, case-sensitive), getLocalizedRequiredSections (all marker types, fallback on missing key)
- `test/integration/language-support.test.ts` — AC-1: update produces German skill files; AC-2: validate-format accepts German headers; AC-3: commithook accepts German usecase; AC-4: unknown language code aborts; AC-5: all five packs load and apply

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Pack I/O in command layer only; core/language.ts is pure logic; pack passed via function params — no violations of architectural constraints | resolved: 2026-03-23
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NFR-1 has measurable threshold "under 500ms" — compliant | resolved: 2026-03-23

## Status
- **State:** in-progress
- **Created:** 2026-03-23
- **Last verified:** 2026-03-23
