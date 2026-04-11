# Implementation: Agent Skill — Module Context Discovery

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a standalone skill (`skills/module-context-discovery.md`) rather than embedding discovery logic in every module orchestrator. This lets developers invoke `/tr-module-context-discovery` directly before any module session, satisfying the "Invoked directly" alternate flow.
- `ux-define.md` embeds Phase 0 inline (duplicating the discovery steps) rather than calling `/tr-module-context-discovery` as a sub-skill. Reason: skill-to-skill invocation has no clean "return" mechanism; embedding ensures the orchestrator retains control and passes context directly to Phase 2 sub-skills.
- Context record written to `taproot/global-truths/project-context_intent.md` (intent-scoped). Intent scope means all modules and all levels pick it up automatically without per-skill opt-in.
- `[?] Get help` at each discovery question delegates to Agent Expertise Assistance behaviour: agent scans project, applies domain knowledge, proposes a concrete answer. Implemented as a step-level branch in the skill rather than a separate sub-skill invocation.
- `module-context-discovery.md` added to `MODULE_SKILL_FILES['user-experience']` in `init.ts`. It is a developer-callable skill (satisfying the `SKILL_FILES — user-facing only` truth) but only needed when a module is declared. Future modules should also include it in their file list.

## Source Files
- `skills/module-context-discovery.md` — standalone skill `/tr-module-context-discovery`: checks for context record, runs discovery (product type → audience → quality goals, each with `[?] Get help`), writes `project-context_intent.md`
- `skills/ux-define.md` — updated: Phase 0 added before Phase 1 scan; checks for context record and runs inline discovery if absent; passes context to Phase 2 sub-skills for archetype-appropriate defaults
- `src/commands/init.ts` — `module-context-discovery.md` added to `MODULE_SKILL_FILES['user-experience']`
- `skills/guide.md` — `/tr-module-context-discovery` entry added
- `taproot/agent/skills/module-context-discovery.md` — synced copy of `skills/module-context-discovery.md`
- `taproot/agent/skills/ux-define.md` — synced copy of `skills/ux-define.md`
- `taproot/agent/skills/guide.md` — synced copy of `skills/guide.md`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- No new TypeScript tests. Skill files are agent-executed markdown. Correctness verified through DoD conditions (skill-architecture/context-engineering, agent-agnostic-language, portable-output-patterns) at commit time.
- `test/integration/init.modules.test.ts` covers `MODULE_SKILL_FILES` installation — updated file list is exercised by existing AC-5 test.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — adds one skill markdown file to skills/ and appends one filename to MODULE_SKILL_FILES['user-experience'] in init.ts. Same pattern as UX skill implementation. No new TypeScript commands, no new architectural modules. | resolved: 2026-04-11
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-11

## Status
- **State:** in-progress
- **Created:** 2026-04-11
- **Last verified:** 2026-04-11
