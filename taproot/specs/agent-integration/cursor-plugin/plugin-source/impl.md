# Implementation: Plugin Source

## Behaviour
../usecase.md

## Design Decisions
- File-based plugin structure in `channels/cursor/` rather than a compiled VS Code extension — matches Cursor's convention-based discovery model (`skills/*/SKILL.md`, `rules/*.mdc`, `commands/*.md`) and keeps the plugin distributable as plain files without a build step on the user's side
- Thin-launcher pattern for SKILL.md files: each launcher contains Cursor-native frontmatter (`name`, `description`) plus a body directing the agent to load the canonical skill from `taproot/agent/skills/<name>.md` — avoids duplicating skill content and ensures the canonical skill is always the source of truth (satisfies AC-3); currently 27 launchers generated
- `scripts/build-cursor-plugin.ts` generates all plugin artifacts from `SKILL_FILES` at source — re-running after `taproot update` keeps the plugin in sync with new or renamed skills without manual file management
- CLI invocation deferred to the project's `taproot/settings.yaml` `cli:` field — the plugin cannot know how taproot is installed in each user's project, so launchers direct the agent to use the project's configured CLI
- Five commands (Initialize, Status, Route Requirement, Report Bug, Build Plan) chosen to match AC-5 — these are the most common entry points for developers unfamiliar with `/tr-*` syntax
- `channels/cursor/rules/taproot.mdc` scoped to `taproot/**` globs — conventions are only injected when the agent has taproot files in context, avoiding noise in unrelated workspaces
- Plugin files are pre-generated and checked in — distributable as-is without requiring users to run a build step

## Source Files
- `scripts/build-cursor-plugin.ts` — generates all `channels/cursor/` plugin artifacts from `SKILL_FILES`; re-run after adding or renaming skills (currently produces 27 SKILL.md launchers under `channels/cursor/skills/`)
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
- **State:** complete
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant — channels/cursor/ follows the channels/<name>/ convention (global truth: all distribution channel artifacts live under channels/<channel-name>/). Build script is standalone. No architectural patterns violated; implementation is a new distribution channel, not a core architectural component. | resolved: 2026-04-09T07:55:55.790Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — NFR-1 is measurable (count of SKILL.md files equals SKILL_FILES.length); AC-7 is testable (set comparison against SKILL_FILES); AC-5 is testable (file existence check for 5 named command files) | resolved: 2026-04-09

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant — channels/cursor/ follows the channels/<name>/ convention (global truth: all distribution channel artifacts live under channels/<channel-name>/). Build script is standalone. No architectural patterns violated; implementation is a new distribution channel, not a core architectural component. | resolved: 2026-04-09T06:16:00.740Z
- condition: document-current | note: Updated docs/agents.md and taproot/agent/docs/agents.md with Cursor native plugin section describing the 26 skill launchers, rules file, 5 commands, and build script. No other docs sections are affected by this implementation. | resolved: 2026-04-09T07:55:41.674Z
- condition: check-if-affected-by: taproot-distribution/vscode-marketplace | note: Not applicable — this implementation creates channels/cursor/ (Cursor plugin), which is a separate distribution channel from channels/vscode/ (VS Code extension). The vscode-marketplace behaviour governs VS Code extension packaging and publication specifically. The two channels are parallel and independent. | resolved: 2026-04-09T07:55:55.791Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable — no skill files (skills/*.md) were modified. The build script and plugin launcher files are not skill files. | resolved: 2026-04-09T07:56:05.033Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No — the build-script-generates-channel-artifacts approach is specific to this distribution channel setup. Insufficient generality to warrant a new pattern entry. | resolved: 2026-04-09T07:56:05.035Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No — the cursor plugin adds a new distribution channel but introduces no cross-cutting enforcement concern. The channels/<name>/ convention is already a global truth. No new DoD gate needed. | resolved: 2026-04-09T07:56:05.036Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable — no skill files modified. pattern-hints applies to skills that route user requests. | resolved: 2026-04-09T07:55:55.790Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — no skill files modified. commit-awareness applies to skills that contain git commit steps. | resolved: 2026-04-09T07:55:55.789Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Not applicable — no skill files (skills/*.md) were modified. Context engineering constraints apply to skills only. | resolved: 2026-04-09T07:55:55.789Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable — the build script is a standalone generator, not an interactive agent skill. No HITL confirmation steps are involved. | resolved: 2026-04-09T07:55:55.788Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable — this implementation produces static plugin files and a build script; there is no agent skill interaction surface or What's next prompt to evaluate. | resolved: 2026-04-09T07:55:55.788Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Compliant — SKILL.md launchers load canonical skills from taproot/agent/skills/ which are agent-agnostic. No agent-specific logic is embedded in the launchers themselves. The channels/cursor/ directory is an adapter layer, not a core definition. | resolved: 2026-04-09T07:55:55.785Z

- condition: check-if-affected: examples/ | note: No examples changes — plugin files are generated from SKILL_FILES, not example-driven. No new examples warranted. | resolved: 2026-04-09T07:55:41.685Z

- condition: check-if-affected: docs/ | note: Updated docs/agents.md with Cursor native plugin section and taproot/agent/docs/agents.md (installed copy). All other docs/ content is current. | resolved: 2026-04-09T07:55:41.685Z

- condition: check-if-affected: skills/guide.md | note: Not affected — guide.md covers the taproot onboarding workflow, not adapter distribution. No changes needed. | resolved: 2026-04-09T07:55:41.685Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected — channels/cursor/ plugin files are generated by scripts/build-cursor-plugin.ts (standalone), not by taproot update. The thin adapter regeneration path in update.ts is unchanged. | resolved: 2026-04-09T07:55:41.684Z

- condition: check-if-affected: package.json | note: No new npm dependencies — build script uses npx tsx (already a dev dependency via vitest). No new CLI commands added to the package. | resolved: 2026-04-09T07:55:41.684Z

