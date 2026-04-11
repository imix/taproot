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
- `test/integration/update.modules.test.ts` — covers AC-1 (declared module installed), AC-2 (no modules → none installed), AC-3 (removed from declaration → files deleted), AC-4 (unknown module name reported), AC-6 (non-module skills unaffected)
- `test/integration/init.modules.test.ts` — covers AC-5 (taproot init respects modules: setting)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — modules?: string[] extends TaprootConfig following the established config-extension pattern (vocabulary, language, naRules). MODULE_SKILL_FILES in init.ts is a central registry following the existing SKILL_FILES pattern. installModuleSkills() parallels installSkills() with a clean separation of concerns. | resolved: 2026-04-11T11:34:53.550Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. | resolved: 2026-04-11

## Status
- **State:** complete
- **Created:** 2026-04-11
- **Last verified:** 2026-04-11

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — modules?: string[] extends TaprootConfig following the established config-extension pattern (vocabulary, language, naRules). MODULE_SKILL_FILES in init.ts is a central registry following the existing SKILL_FILES pattern. installModuleSkills() parallels installSkills() with a clean separation of concerns. | resolved: 2026-04-11T11:50:00.000Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — this implementation is CLI source code (init.ts, update.ts), not a taproot skill file. The contextual-next-steps spec applies to skill .md files that produce primary output. No skill files were modified. | resolved: 2026-04-11T11:32:53.557Z
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — impl.md uses generic language throughout. No Claude-specific terms, @{...} path syntax, or CLAUDE.md references in the spec. Source files (init.ts, update.ts) are CLI code, not skill files. | resolved: 2026-04-11T11:34:51.344Z

- condition: check-if-affected: examples/ | note: NOT AFFECTED — examples do not declare any modules. The opt-in mechanism means existing examples are unaffected: they will simply have no module skills installed, which is correct and expected. | resolved: 2026-04-11T11:34:46.973Z

- condition: check-if-affected: docs/ | note: AFFECTED and updated — docs/modules.md rewritten to accurately describe opt-in semantics. No other docs affected. | resolved: 2026-04-11T11:34:45.339Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED and updated — /tr-ux-define table entry now notes that modules: [user-experience] must be declared in settings before running taproot update. | resolved: 2026-04-11T11:34:42.157Z

- condition: check-if-affected: src/commands/update.ts | note: AFFECTED and updated — update.ts now calls installModuleSkills() after core skill installation, and addModulesHint() to surface the modules: option in existing settings files. | resolved: 2026-04-11T11:34:39.922Z

- condition: check-if-affected: package.json | note: NOT AFFECTED — no new dependencies, no version bump, no script changes required. | resolved: 2026-04-11T11:34:35.683Z

- condition: document-current | note: DONE — docs/modules.md updated: removed 'installed automatically' claim, added opt-in explanation with modules: yaml example. guide.md updated: /tr-ux-define entry notes the modules: [user-experience] requirement. | resolved: 2026-04-11T11:34:33.430Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: NOT APPLICABLE — this implementation modifies CLI source code only, not skill .md files. The portable-output-patterns spec applies to skill authors writing interaction points in skill files. | resolved: 2026-04-11T11:33:14.728Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NOT APPLICABLE — this implementation does not modify any skill files (skills/*.md). Changes are confined to src/commands/init.ts, src/commands/update.ts, and src/validators/types.ts. | resolved: 2026-04-11T11:33:11.461Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the module-gated skills pattern is already captured in the taproot-modules intent and this usecase spec. No additional entry in docs/patterns.md is warranted. | resolved: 2026-04-11T11:33:11.192Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: MINOR FINDING — the modules: opt-in pattern is a new architectural capability but does not warrant a new DoD gate. Module authors should document their own check-if-affected-by entries when creating new modules. No entry needed in global settings.yaml for this story. | resolved: 2026-04-11T11:33:07.260Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — this implementation is CLI source code that does not touch skill files or the agent invocation path. The pattern-hints spec applies to skill files that receive natural language needs from users. | resolved: 2026-04-11T11:33:01.876Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — this implementation does not modify any skill .md files. The commit-awareness spec applies to skill files that include a git commit step. | resolved: 2026-04-11T11:32:59.098Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — this implementation modifies CLI source files (init.ts, update.ts, types.ts), not skill .md files. The context-engineering spec applies to skill file authors. | resolved: 2026-04-11T11:32:58.795Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — this implementation is CLI source code. The pause-and-confirm spec applies to taproot skill files that write multiple documents in sequence (/tr-discover, /tr-decompose). No skill files were modified. | resolved: 2026-04-11T11:32:54.620Z

