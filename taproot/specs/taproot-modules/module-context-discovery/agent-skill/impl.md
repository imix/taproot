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
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — adds one skill markdown file to skills/, appends one filename to MODULE_SKILL_FILES in init.ts, updates ux-define.md with Phase 0 inline steps, and updates docs/. This follows the established pattern used by all UX module skills. No new TypeScript commands or architectural modules. All architecture.md constraints respected: agent-agnostic markdown output, project-agnostic tooling, stateless CLI. | resolved: 2026-04-11T12:59:56.945Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — parent usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds defined. | resolved: 2026-04-11

## Status
- **State:** complete
- **Created:** 2026-04-11
- **Last verified:** 2026-04-11

## DoD Resolutions
- condition: check-if-affected: package.json | note: No new npm dependencies added. Source files are skill markdown files and one array append in init.ts. package.json not affected. | resolved: 2026-04-11T12:57:24.686Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — reviewed module-context-discovery.md and ux-define.md against docs/security.md. No shell command execution in either skill file. No hardcoded credentials or tokens. Least-privilege: skills only read codebase files and taproot/global-truths/, and write to taproot/global-truths/project-context_intent.md (one file, developer-confirmed before write). All writes are within project scope and explicitly confirmed before execution. | resolved: 2026-04-11T12:59:40.306Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: YES — the '[?] Get help' mid-session expertise assistance pattern (agent scans project, applies domain knowledge, proposes a draft answer with alternatives, developer confirms) is introduced here for the first time. Added a 'Mid-session expertise assistance' entry to docs/patterns.md documenting the pattern. | resolved: 2026-04-11T12:59:00.129Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — the project context record is a setup artifact, not a cross-cutting constraint on implementations. It informs module sub-skill defaults but does not impose a DoD check on every implementation. No new check-if-affected-by entries warranted. | resolved: 2026-04-11T12:58:55.486Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: COMPLIANT — module-context-discovery.md uses [artifact-review] pattern for the confirmation step before writing the context record ([Y] Confirm and write / [E] Edit / [S] Skip). No raw rendering instructions. Option letters follow canonical conventions. ux-define.md Phase 0 uses [K]/[U]/[R] for the existing-record case and [Y]/[E]/[S] for the confirmation step — same portable format. | resolved: 2026-04-11T12:58:50.708Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints applies to skills that route natural-language requirement descriptions to matching architectural patterns. Module context discovery collects structured project metadata (product type, audience, quality goals) — it does not route requirements. Outside this spec's scope. | resolved: 2026-04-11T12:58:40.385Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — module-context-discovery.md does not instruct the agent to run git commit. The What's next block lists /tr-commit as an option, which is the correct pattern (suggested next step, not a direct commit instruction). | resolved: 2026-04-11T12:58:35.325Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — module-context-discovery.md pauses for confirmation before writing the context record (step 6: [Y] Confirm and write / [E] Edit / [S] Skip). The ux-define.md Phase 0 mirrors this: step 1d presents the summary for confirmation before step 1e writes. No multi-document write happens without explicit developer confirmation. | resolved: 2026-04-11T12:58:31.467Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — module-context-discovery.md includes a What's next block with 3 options at the end of its primary output. The ux-define.md orchestrator already had a What's next block; Phase 0 ends by flowing into Phase 1 rather than halting, so no extra What's next is needed within Phase 0. | resolved: 2026-04-11T12:58:27.028Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — module-context-discovery.md description is 2 sentences, under 50 tokens. No embedded reference docs. No cross-skill repetition with other discovery skills. File reads are on-demand (step 1: check for existing record only). Session hygiene signal present before What's next block. ux-define.md Phase 0 steps are concise inline steps without embedded docs. | resolved: 2026-04-11T12:58:22.500Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — reviewed skills/module-context-discovery.md and the updated ux-define.md. No bare 'Claude' or 'Claude Code' references. Language uses 'the agent', 'developer', generic pronouns. /tr-module-context-discovery is the standard taproot skill invocation convention, not a Claude-specific mechanism. All output formats are plain text/markdown. | resolved: 2026-04-11T12:58:17.947Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — added 'Project context' section to docs/modules.md documenting /tr-module-context-discovery, the project-context_intent.md record format, and how the [?] Get help option works. | resolved: 2026-04-11T12:58:03.999Z

- condition: check-if-affected: examples/ | note: No examples exercise module context discovery or module orchestrator flows. Not affected. | resolved: 2026-04-11T12:57:35.259Z

- condition: check-if-affected: skills/guide.md | note: AFFECTED AND UPDATED — added /tr-module-context-discovery entry to the slash commands table in skills/guide.md. Synced taproot/agent/skills/guide.md to match. | resolved: 2026-04-11T12:57:32.134Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts imports SKILL_FILES and MODULE_SKILL_FILES from init.ts and iterates them to install skills. Adding module-context-discovery.md to MODULE_SKILL_FILES in init.ts is sufficient — update.ts picks it up automatically at build time. No direct changes to update.ts needed. | resolved: 2026-04-11T12:57:28.514Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — adds one skill markdown file to skills/, appends one filename to MODULE_SKILL_FILES in init.ts, updates ux-define.md with Phase 0 inline steps, and updates docs/. Follows the established pattern used by all UX module skills. No new TypeScript commands or architectural modules. All architecture.md constraints respected: agent-agnostic markdown output, project-agnostic tooling, stateless CLI. | resolved: 2026-04-11T14:00:00.000Z
- condition: document-current | note: Read README.md and docs/ content. Read git diff. README.md does not enumerate skills — the skill list is in skills/guide.md (updated with /tr-module-context-discovery entry). docs/modules.md updated with a 'Project context' section documenting /tr-module-context-discovery, the project-context_intent.md record, and [?] Get help option. docs/patterns.md updated with 'Mid-session expertise assistance' pattern. No new CLI commands added. No additional doc file warranted. | resolved: 2026-04-11T14:00:01.000Z

