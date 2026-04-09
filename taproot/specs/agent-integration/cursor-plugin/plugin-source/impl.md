# Implementation: Plugin Source

## Behaviour
../usecase.md

## Design Decisions
- File-based plugin structure in `channels/cursor/` rather than a compiled VS Code extension — matches Cursor's convention-based discovery model (`skills/*/SKILL.md`, `rules/*.mdc`, `commands/*.md`) and keeps the plugin distributable as plain files without a build step on the user's side
- Thin-launcher pattern for SKILL.md files: each launcher contains Cursor-native frontmatter (`name`, `description`) plus a body directing the agent to load the canonical skill from `taproot/agent/skills/<name>.md` — avoids duplicating skill content and ensures the canonical skill is always the source of truth (satisfies AC-3)
- `scripts/build-cursor-plugin.ts` generates all plugin artifacts from `SKILL_FILES` at source — re-running after `taproot update` keeps the plugin in sync with new or renamed skills without manual file management
- CLI invocation deferred to the project's `taproot/settings.yaml` `cli:` field — the plugin cannot know how taproot is installed in each user's project, so launchers direct the agent to use the project's configured CLI
- Five commands (Initialize, Status, Route Requirement, Report Bug, Build Plan) chosen to match AC-5 — these are the most common entry points for developers unfamiliar with `/tr-*` syntax
- `channels/cursor/rules/taproot.mdc` scoped to `taproot/**` globs — conventions are only injected when the agent has taproot files in context, avoiding noise in unrelated workspaces
- Plugin files are pre-generated and checked in — distributable as-is without requiring users to run a build step

## Source Files
- `scripts/build-cursor-plugin.ts` — generates all `channels/cursor/` plugin artifacts from `SKILL_FILES`; re-run after adding or renaming skills
- `channels/cursor/skills/*/SKILL.md` — thin launcher files, one per entry in `SKILL_FILES` (26 files)
- `channels/cursor/rules/taproot.mdc` — MDC conventions rule injected when taproot files are open
- `channels/cursor/commands/initialize.md` — Initialize command launcher
- `channels/cursor/commands/status.md` — Status command launcher
- `channels/cursor/commands/route-requirement.md` — Route Requirement command launcher
- `channels/cursor/commands/report-bug.md` — Report Bug command launcher
- `channels/cursor/commands/build-plan.md` — Build Plan command launcher
- `channels/cursor/README.md` — plugin documentation

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/cursor-plugin.test.ts` — validates plugin structure: skill count matches SKILL_FILES length (NFR-1), all skills in plugin match SKILL_FILES (AC-7), each SKILL.md references canonical skill path (AC-3), all 5 command files exist (AC-5)

## Status
- **State:** in-progress
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — this implementation adds files to channels/cursor/ and a build script; no architectural patterns or core service design decisions involved | resolved: 2026-04-09
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — NFR-1 is measurable (count of SKILL.md files equals SKILL_FILES.length); AC-7 is testable (set comparison against SKILL_FILES); AC-5 is testable (file existence check for 5 named command files) | resolved: 2026-04-09
