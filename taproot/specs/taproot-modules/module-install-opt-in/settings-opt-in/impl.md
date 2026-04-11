# Implementation: Settings Opt-In

## Behaviour
../usecase.md

## Design Decisions
- `MODULE_SKILL_FILES` constant in `init.ts` maps module name → skill file list. Centralised here so both `init` and `update` use the same source of truth without an extra file.
- UX module skills removed from `SKILL_FILES` (core skills). They are no longer auto-installed by default — only when `user-experience` appears in `modules:`.
- `installSkills()` signature unchanged. A new `installModuleSkills()` function handles module-specific install + removal, keeping the two concerns separate.
- Removal of undeclared module skills: `installModuleSkills()` collects all known module skill filenames, then removes any installed file that is NOT in the declared modules list. This covers AC-3 (module removed from declaration).
- Unknown module names: validated against `Object.keys(MODULE_SKILL_FILES)` before install; reported with available module list; installation continues for valid entries (AC-4).
- `buildSettingsYaml()` gains a commented `# modules:` block so new projects see the option.
- `TaprootConfig.modules?: string[]` added — read by `loadConfig()` via the existing deep-merge path; no additional parsing needed.

## Source Files
- `src/validators/types.ts` — adds `modules?: string[]` to `TaprootConfig`
- `src/commands/init.ts` — removes UX skills from `SKILL_FILES`; adds `MODULE_SKILL_FILES`; adds `installModuleSkills()`; updates `buildSettingsYaml()` with commented modules block
- `src/commands/update.ts` — passes `config.modules` to `installModuleSkills()` after skill install; reports unknown module names

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `src/commands/__tests__/update.modules.test.ts` — covers AC-1 (declared module installed), AC-2 (no modules → none installed), AC-3 (removed from declaration → files deleted), AC-4 (unknown module name reported), AC-6 (non-module skills unaffected)
- `src/commands/__tests__/init.modules.test.ts` — covers AC-5 (taproot init respects modules: setting)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — implementation adds a `modules?: string[]` field to `TaprootConfig`, adds `MODULE_SKILL_FILES` constant and `installModuleSkills()` to `init.ts`, and wires it into `update.ts`. No new commands, no new architectural modules. Follows the established config-extension pattern (same as `vocabulary`, `language`, `naRules`). | resolved: 2026-04-11
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. | resolved: 2026-04-11

## Status
- **State:** in-progress
- **Created:** 2026-04-11
- **Last verified:** 2026-04-11
