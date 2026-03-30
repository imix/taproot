# Implementation: Unified taproot/ Layout

## Behaviour
../usecase.md

## Design Decisions
- **Single `taproot/` directory with subdirectories**: `taproot/specs/` for the requirements hierarchy, `taproot/agent/` for skills/docs, `taproot/settings.yaml` at root. Eliminates the cognitive split between `taproot/` and `.taproot/`.
- **`.taproot/` retained as runtime scratch only (gitignored)**: session files, test results, truth-check sessions are ephemeral — they belong outside version control. No spec or agent content lives there after migration.
- **`resolveAgentDir(cwd)`** in `src/core/paths.ts`: returns `taproot/agent/` if it exists, else falls back to `.taproot/`. Provides backward compatibility for projects that have not yet migrated — `taproot update` handles migration automatically.
- **`findConfigFile()` dual-path lookup** in `src/core/config.ts`: checks `taproot/settings.yaml` first, then `taproot/settings.yaml`. Projects on the old layout continue to work without any manual migration step.
- **`DEFAULT_EXCLUDE` in `fs-walker.ts` extended with `agent` and `specs`**: prevents `validate-structure` from flagging `taproot/agent/` and `taproot/specs/` as orphan folders when `root: taproot/` is configured in settings.
- **`removeStale()` migration in `update.ts`**: `taproot update` detects and migrates `taproot/agent/skills/` → `taproot/agent/skills/`, `.taproot/docs/` → `taproot/agent/docs/`, `.taproot/CONFIGURATION.md` → `taproot/agent/CONFIGURATION.md`. Projects are silently upgraded on next update run.
- **`resolveSkillsRelPath()` in `src/adapters/index.ts`**: adapter generation uses the correct relative path (`taproot/agent/skills/` or `taproot/agent/skills/`) so generated adapter files always point to the real skill location regardless of layout.
- **`migrateHierarchyToSpecs()` in `update.ts`** (rework): `taproot update` detects projects where `root: taproot/` (flat layout) and moves all non-infrastructure directories (`agent`, `global-truths`, `specs`, `node_modules`) into `taproot/specs/`, then rewrites `root:` to `taproot/specs/` in settings.yaml. Config is reloaded after migration so subsequent refreshLinks/overview steps use the correct path. Migration is unconditional (runs before adapter detection).
- **`DEFAULT_CONFIG.root` changed to `taproot/specs/`**: new projects created with `taproot init` use `taproot/specs/` as the default hierarchy root. Existing projects on `root: taproot/` are migrated by `taproot update`.

## Source Files
- `src/core/paths.ts` — new file; exports `resolveAgentDir(cwd)` for layout-aware agent directory resolution
- `src/core/config.ts` — updated `findConfigFile()` to check `taproot/settings.yaml` before `taproot/settings.yaml`
- `src/core/fs-walker.ts` — added `agent` and `specs` to `DEFAULT_EXCLUDE` set
- `src/commands/init.ts` — creates new layout: `taproot/specs/`, `taproot/agent/`, `taproot/settings.yaml`; settings written to `taproot/settings.yaml`
- `src/commands/update.ts` — uses `resolveAgentDir()` throughout; `removeStale()` migrates `taproot/agent/skills/`, `.taproot/docs/`, `.taproot/CONFIGURATION.md` to new paths; `migrateHierarchyToSpecs()` migrates flat `taproot/` hierarchy to `taproot/specs/` subfolder; config reloaded after migration
- `src/adapters/index.ts` — added `resolveSkillsRelPath()` for layout-aware skill path in generated adapter files

## Commits
- (run `taproot link-commits` to populate)
- `c8d6cfd6ed5536a20a8d6efc666feee848d04d9f` — (auto-linked by taproot link-commits)
- `34cf803db764403496dc0c8649060aafaaf5072c` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/init.test.ts` — all AC tests updated to use new layout paths (`taproot/agent/skills/`, `taproot/settings.yaml`)
- `test/integration/adapters.test.ts` — skill path assertions updated to `taproot/agent/skills/`
- `test/integration/update.test.ts` — docs refresh test updated to use new layout; migration tests verify old `.taproot/` content moves correctly
- `test/integration/commithook.test.ts` — settings helper updated to write `taproot/settings.yaml`
- `test/integration/domain-vocabulary.test.ts` — `writeSettings` helper and skill path assertions updated to new layout
- `test/integration/language-support.test.ts` — `writeSettings` helper and skill path assertions updated to new layout
- `test/integration/truth-checker.test.ts` — `makeMinimalSettings` helper updated; AC-8 test fixed with `intent.md` creation

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: INTENTIONAL SUPERSESSION — `docs/architecture.md` contains constraint "Skills, config, and framework files live in `.taproot/`." This implementation is the authoritative change to that constraint: agent files now live in `taproot/agent/`, `.taproot/` is runtime scratch only. `docs/architecture.md` must be updated as part of DoD to reflect the new layout. All other architecture principles (stateless CLI, immutable config, filesystem as data model, no global mutable state) are fully honoured. | resolved: 2026-03-27

- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no **NFR-N:** entries in usecase.md | resolved: 2026-03-27

## DoD Resolutions
- condition: document-current | note: docs/architecture.md updated: replaced outdated .taproot/ constraint with new unified layout description; updated Testing section. docs/cli.md updated: taproot init description, --with-skills path, --template settings path, taproot update docs path. docs/agents.md updated: skills path from taproot/agent/skills/ to taproot/agent/skills/. docs/security.md updated: skill security section paths. docs/configuration.md updated: all taproot/settings.yaml → taproot/settings.yaml, CONFIGURATION.md path updated. docs/patterns.md updated: settings.yaml references. README.md accurately reflects the CLI commands and workflow (no layout references to update). | resolved: 2026-03-27T13:57:26.376Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — skill file changes are path string replacements only. update.ts changes are path string corrections in migration logic with no new attack surface. | resolved: 2026-03-27T17:31:14.825Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — a path correction is not a reusable pattern. | resolved: 2026-03-27T17:31:14.572Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — path correction; no new cross-cutting concern. | resolved: 2026-03-27T17:31:14.318Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — backlog migration in removeStale() follows existing migration patterns (stateless, filesystem as data model, I/O at command boundary). No architectural deviations. | resolved: 2026-03-27T17:31:14.063Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — update.ts does not receive natural language requirement descriptions. | resolved: 2026-03-27T17:31:13.802Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — update.ts does not contain commit steps. | resolved: 2026-03-27T17:31:13.549Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — update.ts is a CLI command, not a skill. | resolved: 2026-03-27T17:31:13.294Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — update.ts is a CLI command that does not author multiple documents interactively. | resolved: 2026-03-27T17:31:13.042Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — update.ts is a CLI command, not a skill with interactive next-steps. | resolved: 2026-03-27T17:31:12.780Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — no agent-specific language in update.ts or migration messages. | resolved: 2026-03-27T17:31:12.521Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — examples demonstrate hierarchy structure; backlog path is not referenced in starter examples. | resolved: 2026-03-27T17:31:12.265Z

- condition: check-if-affected: docs/ | note: COMPLIANT — docs/architecture.md already updated. No further docs/ changes required for the path correction. | resolved: 2026-03-27T17:31:11.992Z

- condition: check-if-affected: skills/guide.md | note: APPLIED — updated taproot/agent/backlog.md reference to taproot/backlog.md. | resolved: 2026-03-27T17:31:11.735Z

- condition: check-if-affected: src/commands/update.ts | note: APPLIED — corrected backlog migration target from taproot/agent/backlog.md to taproot/backlog.md; added migration step to move taproot/agent/backlog.md → taproot/backlog.md for existing projects on the erroneous v0.6.0 layout. | resolved: 2026-03-27T17:31:11.479Z

- condition: document-current | note: COMPLIANT — docs/architecture.md was already updated to reflect the unified layout. The backlog.md path correction (taproot/agent/backlog.md → taproot/backlog.md) is an internal skill path; no CLI commands or config options changed. | resolved: 2026-03-27T17:31:11.217Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified in this rework — only src/commands/update.ts, src/core/config.ts, and two test files. | resolved: 2026-03-27T16:14:19.218Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — directory migration with exclusion list and settings rewrite is a one-time upgrade utility, not a reusable pattern for taproot users. | resolved: 2026-03-27T16:14:18.953Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO new concern — migrateHierarchyToSpecs() is an internal migration step in taproot update. No new cross-cutting contract introduced. | resolved: 2026-03-27T16:14:18.670Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — migrateHierarchyToSpecs() follows all architecture principles: stateless CLI function, immutable config after load (config reloaded between migration phases as designed), external I/O at command boundary, no global mutable state, filesystem as data model. Fits the existing migration pattern in removeStale(). | resolved: 2026-03-27T16:13:36.939Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints governs skills that process user needs. taproot update is a CLI setup command. | resolved: 2026-03-27T16:13:36.680Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commit-awareness constrains skill files containing git commit steps. No skill files modified in this rework. | resolved: 2026-03-27T16:13:36.422Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill files. This rework modifies CLI TypeScript source files only. | resolved: 2026-03-27T16:13:36.164Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm governs bulk-authoring agent skills. taproot update is a CLI migration command. | resolved: 2026-03-27T16:13:25.004Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — contextual-next-steps governs agent skills producing primary output. This rework modifies CLI commands (taproot update), not skills. | resolved: 2026-03-27T16:13:24.703Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this rework modifies CLI source files (src/commands/update.ts, src/core/config.ts) and test files. None are skill files or shared hierarchy docs subject to agent-agnostic-language. | resolved: 2026-03-27T16:13:24.449Z

- condition: check-if-affected: examples/ | note: REWORK: not affected — examples/ was reviewed in the initial implementation. No new behaviour in this rework requires example updates. | resolved: 2026-03-27T16:12:46.167Z

- condition: check-if-affected: docs/ | note: REWORK: not affected — docs/ was updated in the initial implementation. This rework adds update.ts migration logic only; no new CLI commands, flags, or configuration options introduced that require doc changes. | resolved: 2026-03-27T16:12:45.909Z

- condition: check-if-affected: skills/guide.md | note: REWORK: not affected — skills/guide.md was updated in the initial implementation for path changes. This rework adds a CLI-side migration step only; no skill content changes. | resolved: 2026-03-27T16:12:45.651Z

- condition: check-if-affected: src/commands/update.ts | note: REWORK: PRIMARY source file — migrateHierarchyToSpecs() added to move flat taproot/ hierarchy dirs into taproot/specs/, update root: in settings.yaml, and reload config. Settings migration (old taproot/settings.yaml) also made unconditional. Both changes run before adapter detection. | resolved: 2026-03-27T16:11:09.164Z

- condition: document-current | note: REWORK: Design Decisions updated with migrateHierarchyToSpecs() and DEFAULT_CONFIG.root change. Source Files updated to reflect new update.ts behaviour. Two regression test files (architecture-compliance.test.ts, nfr-measurability.test.ts) updated from taproot/settings.yaml to taproot/settings.yaml. No doc changes needed beyond what was already done in the initial implementation — this rework adds a migration step in update.ts only. | resolved: 2026-03-27T16:11:03.935Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — 11 skill files were updated (backlog, commit, implement, guide, behaviour, refine, status, review-all, ineed, bug, discover-truths). All changes are path updates only (from .taproot/ prefix to taproot/agent/ or taproot/). No shell command execution was added or removed. No credentials or tokens introduced. No least-privilege changes — existing agent instructions unchanged except file paths. | resolved: 2026-03-27T14:00:32.751Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — dual-path fallback (resolveAgentDir) is an internal migration strategy, not a pattern that taproot users apply. The migration-via-update pattern (removeStale) is an implementation detail, not a user-facing architectural pattern. No new entry in docs/patterns.md warranted. | resolved: 2026-03-27T14:00:32.497Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: YES — this implementation changes where taproot/settings.yaml lives (from .taproot/ to taproot/). Any implementation that reads settings.yaml or writes to the agent directory should be verified against the new paths. However, no new check-if-affected-by entry is warranted — this is a migration, not a new ongoing concern. The resolveAgentDir() function in src/core/paths.ts handles both layouts. No addition to settings.yaml required. | resolved: 2026-03-27T14:00:32.248Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — docs/architecture.md updated to reflect the new unified layout. All other architectural principles honoured: stateless CLI commands, immutable config after load, external I/O at command boundaries, no global mutable state, filesystem as data model, agent-agnostic output. New src/core/paths.ts follows module boundary rules (core module, pure logic). Error messages remain actionable. | resolved: 2026-03-27T14:00:31.993Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints governs skills that process user needs and should surface relevant patterns. taproot init and taproot update are CLI setup commands, not user-need processing skills. | resolved: 2026-03-27T13:59:56.597Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commit-awareness constrains skill files that contain git commit steps. This implementation modifies CLI source code, not skill files. No skill file changes introduce new git commit steps. | resolved: 2026-03-27T13:59:56.346Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering governs skill files (skills/*.md). This implementation modifies CLI commands and core TypeScript files. The skill file updates made (backlog, commit, implement, etc.) are path updates, not structural changes to how skills load or present context. | resolved: 2026-03-27T13:59:56.095Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm governs bulk-authoring agent skills (e.g. tr-sweep). taproot init and taproot update are CLI setup commands; they prompt at the start of execution, not at each step. | resolved: 2026-03-27T13:58:29.422Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — contextual-next-steps governs agent skills that produce primary output and must present a What's next? block. This implementation modifies CLI setup commands (taproot init, taproot update), not agent skills. | resolved: 2026-03-27T13:58:29.169Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this implementation modifies CLI source files (src/commands/init.ts, src/commands/update.ts, src/core/paths.ts, src/core/config.ts, src/core/fs-walker.ts, src/adapters/index.ts). None of these are skill files or shared hierarchy docs. Adapter files (.claude/commands/, .gemini/commands/) are explicitly excluded from the agent-agnostic-language standard per its Scope section. | resolved: 2026-03-27T13:58:28.908Z

- condition: check-if-affected: examples/ | note: AFFECTED (noted, not updated) — examples/ README files and settings/ templates reference taproot/settings.yaml. These remain accurate as examples of the old layout that taproot update will migrate. Updating example READMEs to reflect new layout is tracked as a follow-up (the examples/ templates will regenerate correctly after taproot update is run on any example project). | resolved: 2026-03-27T13:58:12.631Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — see document-current resolution above. docs/architecture.md, docs/cli.md, docs/agents.md, docs/security.md, docs/configuration.md, docs/patterns.md all updated to reflect new layout paths. | resolved: 2026-03-27T13:58:12.376Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED AND UPDATED — skills/guide.md updated: backlog.md reference changed from taproot/backlog.md to taproot/agent/backlog.md. Also updated 10 other skill files (backlog, commit, implement, behaviour, refine, status, review-all, ineed, bug, discover-truths) to reference new layout paths. Copied to taproot/agent/skills/ for the taproot project itself. | resolved: 2026-03-27T13:57:52.776Z

- condition: check-if-affected: src/commands/update.ts | note: AFFECTED AND IMPLEMENTED — update.ts is a primary source file in this implementation. removeStale() was extended to migrate taproot/agent/skills/ → taproot/agent/skills/, .taproot/docs/ → taproot/agent/docs/, and .taproot/CONFIGURATION.md → taproot/agent/CONFIGURATION.md. resolveAgentDir() is used throughout update.ts for all agent-dir writes. | resolved: 2026-03-27T13:57:52.524Z

