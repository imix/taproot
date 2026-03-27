# Implementation: Unified taproot/ Layout

## Behaviour
../usecase.md

## Design Decisions
- **Single `taproot/` directory with subdirectories**: `taproot/specs/` for the requirements hierarchy, `taproot/agent/` for skills/docs, `taproot/settings.yaml` at root. Eliminates the cognitive split between `taproot/` and `.taproot/`.
- **`.taproot/` retained as runtime scratch only (gitignored)**: session files, test results, truth-check sessions are ephemeral — they belong outside version control. No spec or agent content lives there after migration.
- **`resolveAgentDir(cwd)`** in `src/core/paths.ts`: returns `taproot/agent/` if it exists, else falls back to `.taproot/`. Provides backward compatibility for projects that have not yet migrated — `taproot update` handles migration automatically.
- **`findConfigFile()` dual-path lookup** in `src/core/config.ts`: checks `taproot/settings.yaml` first, then `.taproot/settings.yaml`. Projects on the old layout continue to work without any manual migration step.
- **`DEFAULT_EXCLUDE` in `fs-walker.ts` extended with `agent` and `specs`**: prevents `validate-structure` from flagging `taproot/agent/` and `taproot/specs/` as orphan folders when `root: taproot/` is configured in settings.
- **`removeStale()` migration in `update.ts`**: `taproot update` detects and migrates `.taproot/skills/` → `taproot/agent/skills/`, `.taproot/docs/` → `taproot/agent/docs/`, `.taproot/CONFIGURATION.md` → `taproot/agent/CONFIGURATION.md`. Projects are silently upgraded on next update run.
- **`resolveSkillsRelPath()` in `src/adapters/index.ts`**: adapter generation uses the correct relative path (`taproot/agent/skills/` or `.taproot/skills/`) so generated adapter files always point to the real skill location regardless of layout.

## Source Files
- `src/core/paths.ts` — new file; exports `resolveAgentDir(cwd)` for layout-aware agent directory resolution
- `src/core/config.ts` — updated `findConfigFile()` to check `taproot/settings.yaml` before `.taproot/settings.yaml`
- `src/core/fs-walker.ts` — added `agent` and `specs` to `DEFAULT_EXCLUDE` set
- `src/commands/init.ts` — creates new layout: `taproot/specs/`, `taproot/agent/`, `taproot/settings.yaml`; settings written to `taproot/settings.yaml`
- `src/commands/update.ts` — uses `resolveAgentDir()` throughout; `removeStale()` migrates `.taproot/skills/`, `.taproot/docs/`, `.taproot/CONFIGURATION.md` to new paths
- `src/adapters/index.ts` — added `resolveSkillsRelPath()` for layout-aware skill path in generated adapter files

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/init.test.ts` — all AC tests updated to use new layout paths (`taproot/agent/skills/`, `taproot/settings.yaml`)
- `test/integration/adapters.test.ts` — skill path assertions updated to `taproot/agent/skills/`
- `test/integration/update.test.ts` — docs refresh test updated to use new layout; migration tests verify old `.taproot/` content moves correctly
- `test/integration/commithook.test.ts` — settings helper updated to write `taproot/settings.yaml`
- `test/integration/domain-vocabulary.test.ts` — `writeSettings` helper and skill path assertions updated to new layout
- `test/integration/language-support.test.ts` — `writeSettings` helper and skill path assertions updated to new layout
- `test/integration/truth-checker.test.ts` — `makeMinimalSettings` helper updated; AC-8 test fixed with `intent.md` creation

## Status
- **State:** in-progress
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: INTENTIONAL SUPERSESSION — `docs/architecture.md` contains constraint "Skills, config, and framework files live in `.taproot/`." This implementation is the authoritative change to that constraint: agent files now live in `taproot/agent/`, `.taproot/` is runtime scratch only. `docs/architecture.md` must be updated as part of DoD to reflect the new layout. All other architecture principles (stateless CLI, immutable config, filesystem as data model, no global mutable state) are fully honoured. | resolved: 2026-03-27

- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no **NFR-N:** entries in usecase.md | resolved: 2026-03-27
