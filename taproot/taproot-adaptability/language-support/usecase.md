# Behaviour: Language Support

## Actor
Developer configuring taproot for a non-English team — setting `language: de` (or another supported locale) in `settings.yaml` to localise structural elements throughout the hierarchy

## Preconditions
- taproot is initialised in the project (`taproot/` directory exists, `settings.yaml` present)
- Developer sets `language: <code>` in `settings.yaml` where `<code>` is one of the shipped language packs (de, fr, es, ja, pt)
- If `language:` is set in `settings.yaml` **before** `taproot init` is run, `taproot init` applies the language pack during initial skill installation — a subsequent `taproot update` is not required

## Main Flow
1. Developer sets `language: de` in `settings.yaml`
2. Developer runs `taproot update` to apply the language pack
3. taproot loads the language pack for `de` from its shipped `languages/de.json`
4. taproot substitutes all structural keyword tokens in installed skill files with their German equivalents:
   - Section headers (e.g. `## Goal` → `## Ziel`, `## Actor` → `## Akteur`)
   - Gherkin keywords (`Given` → `Gegeben`, `When` → `Wenn`, `Then` → `Dann`)
   - State values (`specified` → `spezifiziert`, `implemented` → `implementiert`, `complete` → `vollständig`)
5. taproot regenerates agent adapter files with the same substitutions applied
   ↳ Steps 1–5 are install-time effects of `taproot update`. Steps 6–8 describe runtime behaviour that takes effect immediately because validators and hooks read the language setting from `settings.yaml` at invocation time — not from any file modified by `taproot update`.
6. `taproot validate-format` and `taproot commithook` read the configured `language:` value from `settings.yaml` at startup, load the corresponding language pack, and use its section header key list as the set of accepted headers — replacing the hardcoded English set
7. taproot's own CLI output messages remain in English — CLI message translation is out of scope for this behaviour; the language pack covers structural keywords only (section headers, Gherkin keywords, state values)
8. Developer authors new specs using the German structural keywords — the pre-commit hook accepts them without section-header errors

## Alternate Flows

### Unknown language code
- **Trigger:** `language: xx` references a code with no shipped pack
- **Steps:**
  1. `taproot update` reports: "Unknown language pack 'xx'. Supported: de, fr, es, ja, pt, en (default)"
  2. taproot aborts without modifying any skill or adapter files

### Language pack missing a key
- **Trigger:** A shipped language pack is missing a section header key (malformed pack)
- **Steps:**
  1. taproot falls back to the English string for the missing key
  2. taproot logs a warning: "Language pack 'de' missing key 'NFR' — using English fallback"
  3. taproot continues with the remainder of the pack applied

### Language switch on a project with existing English-header documents
- **Trigger:** Developer sets `language: de` on a project where hierarchy documents already exist with English section headers
- **Steps:**
  1. `taproot update` succeeds — skill files are localised to German
  2. `taproot validate-format` run on any existing document reports: "Section header `## Actor` not recognised under language pack 'de' — expected `## Akteur`. This document was authored in a different language. Run `taproot migrate-language` to convert existing documents (not yet implemented)."
  3. The developer must either manually update existing document headers or wait for the `taproot migrate-language` command (deferred behaviour)
  4. New documents created after the switch use the configured language and pass validation immediately

### Developer switches back to English
- **Trigger:** Developer removes or unsets `language:` in `settings.yaml`
- **Steps:**
  1. `taproot update` reapplies skills with the default English language pack
  2. All structural keywords revert to English
  3. Existing hierarchy documents authored in the previous language are not modified — they remain as-is until the developer re-runs `taproot update` with migration flags (future behaviour)

## Postconditions
- Installed skill files contain the target language's structural keywords, not English tokens
- Validators accept section headers matching the configured language pack
- The pre-commit hook enforces the configured language pack's section header names

## Error Conditions
- **Unsupported language code** — `taproot update` aborts with a clear list of supported codes; no files are modified
- **Malformed language pack JSON** — `taproot update` aborts with a parse error and the offending file path; no files are modified
- **Partial update failure** — if `taproot update` is interrupted mid-substitution (filesystem error, process killed), skill files may be in a mixed-language state; taproot does not detect or recover from this automatically — the developer must re-run `taproot update` to restore a consistent state
- **`taproot overview` regeneration overwrites substitutions** — `taproot overview` regenerates `taproot/OVERVIEW.md` using English-language structural vocabulary; running it after a language switch will overwrite any localisation in that file; localised overview generation is a known gap and is deferred
- **Language pack not found at runtime** — if `language: <code>` is configured but the pack file cannot be resolved (corrupt installation or version mismatch), validators and the commithook fall back to English and emit a warning: "Language pack '<code>' could not be loaded — falling back to English. Check your taproot installation."

## Related
- `../../requirements-hierarchy/configure-hierarchy/usecase.md` — `settings.yaml` is the configuration surface; `language:` is a new field in the same file
- `../domain-vocabulary/usecase.md` — domain vocabulary overrides are applied after the language pack; both substitution passes run at `taproot update` time
- `../../hierarchy-integrity/validate-format/usecase.md` — validators must read accepted section headers from the language pack, not hardcoded English strings
- `../../hierarchy-integrity/pre-commit-enforcement/usecase.md` — the pre-commit hook enforces the language pack's section header names

## Acceptance Criteria

**AC-1: Language pack applied at `taproot update`**
- Given `language: de` is set in `settings.yaml`
- When the developer runs `taproot update`
- Then for every token defined in `src/languages/de.json`, all occurrences of the English original in installed skill files are replaced with the German equivalent — verified by checking that the English token strings do not appear in any position where the German equivalents should be

**AC-2: Validator accepts configured language's section headers**
- Given `language: de` is configured and a `usecase.md` is authored with `## Akteur` and `## Vorbedingungen`
- When `taproot validate-format` runs on that file
- Then validation passes — no "missing section" errors are reported

**AC-3: Pre-commit hook enforces configured language**
- Given `language: de` is configured and a developer commits a `usecase.md` using German section headers
- When the pre-commit hook runs
- Then the commit is accepted without section-header errors

**AC-4: Unknown language code aborts cleanly**
- Given `language: xx` is set in `settings.yaml`
- When `taproot update` runs
- Then it reports the unsupported language code, lists valid options, and exits without modifying any files

**AC-5: Five language packs ship with taproot**
- Given a fresh taproot installation
- When a developer sets `language:` to any of `de`, `fr`, `es`, `ja`, or `pt`
- Then `taproot update` succeeds without errors and at least one section header token (e.g. `## Actor`) in an installed skill file is replaced with its target-language equivalent (e.g. `## Akteur` for `de`)

**NFR-1: Language pack load adds no perceptible latency to `taproot update`**
- Given a language pack JSON file of up to 200 keys
- When `taproot update` loads and applies the pack
- Then the total additional time for substitution is under 500ms on a standard developer machine

## Language Pack Schema
A language pack is a flat JSON file at `src/languages/<code>.json`. All keys are required; missing keys fall back to the English default. Additional keys beyond this list are ignored.

Pack files ship as part of the taproot npm package, co-located with the compiled output. Validators resolve them relative to the installed package root — the same mechanism used for bundled skill files. Pack files must be declared in the package's `files` array to be included in the npm publish.

**Scope:** impl.md required sections (`Behaviour`, `Commits`, `Tests`) are intentionally excluded from localisation — they are technical traceability fields always written in English regardless of the configured language pack.

| Key | English default | Example (de) |
|-----|-----------------|--------------|
| `Goal` | `Goal` | `Ziel` |
| `Actor` | `Actor` | `Akteur` |
| `Preconditions` | `Preconditions` | `Vorbedingungen` |
| `Main Flow` | `Main Flow` | `Hauptablauf` |
| `Alternate Flows` | `Alternate Flows` | `Alternative Abläufe` |
| `Postconditions` | `Postconditions` | `Nachbedingungen` |
| `Error Conditions` | `Error Conditions` | `Fehlerfälle` |
| `Acceptance Criteria` | `Acceptance Criteria` | `Akzeptanzkriterien` |
| `Status` | `Status` | `Status` |
| `Stakeholders` | `Stakeholders` | `Stakeholder` |
| `Success Criteria` | `Success Criteria` | `Erfolgskriterien` |
| `Given` | `Given` | `Gegeben` |
| `When` | `When` | `Wenn` |
| `Then` | `Then` | `Dann` |
| `specified` | `specified` | `spezifiziert` |
| `implemented` | `implemented` | `implementiert` |
| `complete` | `complete` | `vollständig` |
| `active` | `active` | `aktiv` |

## Status
- **State:** specified
- **Created:** 2026-03-23
- **Last reviewed:** 2026-03-23
