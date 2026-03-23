# Behaviour: Language Support

## Actor
Developer configuring taproot for a non-English team — setting `language: de` (or another supported locale) in `settings.yaml` to localise structural elements throughout the hierarchy

## Preconditions
- taproot is initialised in the project (`taproot/` directory exists, `settings.yaml` present)
- Developer sets `language: <code>` in `settings.yaml` where `<code>` is one of the shipped language packs (de, fr, es, ja, pt)

## Main Flow
1. Developer sets `language: de` in `settings.yaml`
2. Developer runs `taproot update` to apply the language pack
3. taproot loads the language pack for `de` from its shipped `languages/de.json`
4. taproot substitutes all structural keyword tokens in installed skill files with their German equivalents:
   - Section headers (e.g. `## Goal` → `## Ziel`, `## Actor` → `## Akteur`)
   - Gherkin keywords (`Given` → `Gegeben`, `When` → `Wenn`, `Then` → `Dann`)
   - State values (`specified` → `spezifiziert`, `implemented` → `implementiert`, `complete` → `vollständig`)
5. taproot regenerates agent adapter files with the same substitutions applied
6. Validators (`taproot validate-format`, `taproot commithook`) read accepted section header names from the loaded language pack instead of hardcoded English strings
7. CLI output messages are rendered using the loaded language pack's message strings
8. Developer authors new specs using the German structural keywords — the pre-commit hook accepts them

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
- `taproot validate-format` passes on documents authored using the configured language's keywords

## Error Conditions
- **Unsupported language code** — `taproot update` aborts with a clear list of supported codes; no files are modified
- **Malformed language pack JSON** — `taproot update` aborts with a parse error and the offending file path; no files are modified

## Related
- `../../requirements-hierarchy/configure-hierarchy/usecase.md` — `settings.yaml` is the configuration surface; `language:` is a new field in the same file
- `../domain-vocabulary/usecase.md` — domain vocabulary overrides are applied after the language pack; both substitution passes run at `taproot update` time
- `../../hierarchy-integrity/validate-format/usecase.md` — validators must read accepted section headers from the language pack, not hardcoded English strings
- `../../hierarchy-integrity/pre-commit-enforcement/usecase.md` — the pre-commit hook enforces the language pack's section header names

## Acceptance Criteria

**AC-1: Language pack applied at `taproot update`**
- Given `language: de` is set in `settings.yaml`
- When the developer runs `taproot update`
- Then installed skill files contain German structural keywords (`## Ziel`, `## Akteur`, `Gegeben`/`Wenn`/`Dann`) and no English equivalents remain in substituted positions

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
- Then `taproot update` succeeds without errors and applies the correct language pack

**NFR-1: Language pack load adds no perceptible latency to `taproot update`**
- Given a language pack JSON file of up to 200 keys
- When `taproot update` loads and applies the pack
- Then the total additional time for substitution is under 500ms on a standard developer machine

## Status
- **State:** specified
- **Created:** 2026-03-23
- **Last reviewed:** 2026-03-23
