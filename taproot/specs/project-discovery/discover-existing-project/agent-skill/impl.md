# Implementation: Agent Skill — /tr-discover

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill rather than a CLI command — discovery requires interactive dialogue with the user to surface business goals from code; no automated heuristic can replace that conversation
- Session state is persisted to `taproot/_sessions/discovery-status.md` after every confirmed item — allows safe interruption and resumption without losing progress
- Phase progression is linear (Orient → Intents → Behaviours → Implementations) but each phase is checkpointed independently — the status file tracks which items are complete within each phase
- Depth control (`intents-only`, `behaviours`, `full`) allows developers to do a lightweight intent-capture session and defer detail work
- Requirements artifact detection uses naming heuristics only (prd, specs, stories, epics, adr, design, rfcs, etc.) — no hardcoded tool knowledge. The agent reads and reasons about whatever it finds; if the format is unfamiliar, it researches before proceeding
- Conflict resolution (source vs requirements) is always explicit — the developer is asked before discovery proceeds; the choice is recorded in the status file and applied throughout the session
- Requirements-only projects skip Phase 4 (impl.md creation) entirely — behaviours are written with `status: specified` rather than `implemented`

## Source Files
- `skills/discover.md` — canonical skill definition (package source)
- `taproot/agent/skills/discover.md` — installed copy

## Commits
- (run `taproot link-commits` to populate)
- `137233ff0f11dc8402174d1e6dff6f303bea5217` — (auto-linked by taproot link-commits)
- `2c71ee4ef7c2762f1a60a2517b28a9dbb8b011bc` — (auto-linked by taproot link-commits)
- `36b79b026505060332e28877befb642384b3e584` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — validates skill file format and required sections

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: This implementation modifies skills/discover.md — a plain markdown agent skill file. Compliant with agent-agnostic output constraint. No CLI commands, no source modules, no architectural concerns apply. | resolved: 2026-03-20T00:00:00.000Z

## DoD Resolutions
- condition: document-current | note: Updated README.md: changed '/tr-discover — reverse-engineer an existing codebase' to 'existing project (source, requirements, or both)'. guide.md does not mention /tr-discover and needs no update. docs/ has no discover-specific content. | resolved: 2026-03-20T19:49:07.565Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No. Global-truths routing is specific to the discover skill and does not introduce a constraint applicable to other implementations. No new settings.yaml gate needed. | resolved: 2026-04-06T15:12:06.391Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Phase 1.5 is read-only: agent reads the project, identifies content, proposes to the user, and writes truth files on confirmation. No shell commands introduced. No credentials or tokens. Agent instructions follow least-privilege — every write requires explicit [Y] confirmation. Compliant. | resolved: 2026-04-06T15:11:48.639Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Phase 1.5 uses generic agent language throughout: 'agent proposes', 'developer confirms', [Y]/[E]/[S] menu. No Claude-specific syntax (@{project-root}, CLAUDE.md), no agent-specific tool references. Compliant. | resolved: 2026-04-06T15:11:35.560Z

- condition: check-if-affected: examples/ | note: examples/ contains starter hierarchy templates, not skill definitions. The discover skill Phase 1.5 addition does not affect example content. | resolved: 2026-04-06T15:11:24.972Z

- condition: check-if-affected: docs/ | note: Updated docs/agent-internals.md: added Phase 1.5 (Cross-cutting truths) to the /tr-discover phase list. No other docs/ files describe the discover phase flow. | resolved: 2026-04-06T15:11:14.598Z

- condition: check-if-affected: package.json | note: Skill-only change — no new dependencies introduced. package.json not affected. | resolved: 2026-04-06T15:10:42.320Z

- condition: sessions-rename | note: skills/discover.md updated: _brainstorms/ renamed to _sessions/ throughout. Naming change only — no behavioural change. All existing DoD conditions remain valid. | resolved: 2026-03-20T20:13:47.476Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. Heuristic requirements artifact detection is specific to the discover skill. Not a reusable pattern applicable across the hierarchy. | resolved: 2026-03-20T19:49:50.950Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No. Global-truths routing is specific to the discover skill — it is not a constraint that applies to other implementations. No new settings.yaml gate needed. | resolved: 2026-04-06T15:11:41.500Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Already resolved at DoR. Skill file is plain markdown — compliant with agent-agnostic output constraint. No source modules or architectural concerns involved. | resolved: 2026-03-20T19:49:50.490Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. discover.md does not process user-expressed needs in a way that triggers pattern scanning. Pattern hints fire in skills that receive a natural language requirement (tr-ineed, tr-behaviour, etc.); discover surfaces intents from code/requirements via structured interview, not from a stated need. | resolved: 2026-03-20T19:49:42.775Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — discover.md contains no git commit steps. The skill writes taproot hierarchy files but does not instruct the agent to commit. | resolved: 2026-03-20T19:49:42.549Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: C-1: Description trimmed to ~30 tokens — 'Reverse-engineer an existing project into a taproot hierarchy — from source code, existing requirements artifacts (PRDs, stories, ADRs), or both. Interviews the user to surface business intents and behaviours. Heavily interactive.' Compliant. C-2: No embedded reference docs — Document Formats section contains template scaffolding, not reference content. C-3: No cross-skill repetition. C-4: On-demand loading — each phase reads only what it needs at that step. C-5: /compact signal present at Phase 5 before What's next? block. C-6: What's next? block present at step 17. | resolved: 2026-03-20T19:49:36.571Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Compliant. discover.md presents each proposed intent/behaviour/impl with [Y]/[E]/[S]/[Q] menu before writing. All three document types paused for developer confirmation. | resolved: 2026-03-20T19:49:25.712Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. discover.md has a What's next? block at Phase 5 step 17 (final step), presenting [A] /tr-status, [B] /tr-next, [C] /tr-ineed. | resolved: 2026-03-20T19:49:25.480Z

- condition: check-if-affected: skills/guide.md | note: Not affected. guide.md's command table does not include /tr-discover; this change does not add or remove any commands. No update needed. | resolved: 2026-03-20T19:49:16.986Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. update.ts copies skill files by name; discover.md filename unchanged. No new CLI commands introduced. | resolved: 2026-03-20T19:49:16.752Z

