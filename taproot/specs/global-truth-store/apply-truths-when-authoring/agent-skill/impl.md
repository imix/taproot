# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- **Inline injection, not a standalone sub-skill**: the truth-loading procedure is embedded directly into each affected authoring skill rather than extracted into a separate `/tr-apply-truths-when-authoring` command. Skills are designed to be self-contained — adding an inter-skill dependency would require every authoring skill to call another skill as a sub-routine, which no existing skill does. Inlining keeps skills readable and avoids a user-facing command that has no meaningful standalone use.
- **Four skills targeted, ineed.md excluded**: `/tr-intent`, `/tr-behaviour`, `/tr-implement`, and `/tr-refine` each draft or update a hierarchy document and are injected. `/tr-ineed` is a routing skill — it delegates to one of the four above, where truth-loading already happens. Injecting into the router too would cause double-loading.
- **Injection point per skill**: intent.md step 2a (after overlap check, before draft); behaviour.md step 1b (after pattern check, before sibling scan); implement.md step 3a (after parent intent read, before plan); refine.md step 2a (after classification, before draft changes). Each point is immediately before the first act of content authoring.
- **No TypeScript changes**: the entire implementation is prose modification of existing skill files. No new CLI commands, no SKILL_FILES entry — apply-truths-when-authoring is a cross-cutting pre-step woven into existing skills, not a new registerable command.

## Source Files
- `skills/intent.md` — added step 2a: load applicable truths before drafting an intent
- `skills/behaviour.md` — added step 1b: load applicable truths before specifying a use case
- `skills/implement.md` — added step 3a: load applicable truths before planning an implementation
- `skills/refine.md` — added step 2a: load applicable truths before drafting spec changes
- `taproot/agent/skills/intent.md` — synced copy
- `taproot/agent/skills/behaviour.md` — synced copy
- `taproot/agent/skills/implement.md` — synced copy
- `taproot/agent/skills/refine.md` — synced copy

## Commits
- (run `taproot link-commits` to populate)
- `d7db0fcee78c8b69ce4cddeb7accabd57ea3c27a` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/apply-truths-when-authoring.test.ts` — covers AC-1 (intent-scoped truth applied in behaviour spec), AC-2 (scope filtering: impl-scoped not loaded at behaviour level), AC-3 (contradiction detection in all four skills), AC-4 (no-truths proceeds normally), AC-5 (unscoped file treated as intent-scoped with note)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed docs/architecture.md; this implementation modifies four skills/*.md prose files — no TypeScript changes, no new CLI commands, no SKILL_FILES registration. Adding a pre-draft step to existing skills is an additive prose change with no architectural decisions. Agent-agnostic output principle preserved (no agent-specific syntax added). No deviations. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — apply-truths-when-authoring/usecase.md contains no NFR-N entries in ## Acceptance Criteria. The behaviour has no performance, reliability, or accessibility thresholds. | resolved: 2026-03-26

## Status
- **State:** complete
- **Created:** 2026-03-26
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: docs/workflows.md already covers the global truths workflow. docs/cli.md lists CLI commands only — this implementation adds no CLI commands. skills/guide.md is handled by check-if-affected below. No other docs/ files list individual skill pre-steps. README.md does not enumerate skill internals. Docs are current. | resolved: 2026-03-26T15:17:40.435Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: APPLIES — behaviour.md and implement.md modified. Reviewed added enforcement note: no shell command execution, no credentials or tokens. The note is read-only informational prose. Least-privilege preserved. Compliant. | resolved: 2026-03-29T19:15:01.261Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: YES — already done. Added 'Global truths are live commit constraints' pattern to docs/patterns.md with enforcement explanation, practical implications, signal phrases, and spec link. | resolved: 2026-03-29T19:15:00.992Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — surfacing existing enforcement behavior more clearly does not introduce a new cross-cutting concern. The enforcement is already implemented via commithook. | resolved: 2026-03-29T19:15:00.724Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — prose-only changes to skills/behaviour.md, skills/implement.md, and docs/patterns.md. No TypeScript changes, no new CLI commands. docs/architecture.md constraints unaffected. | resolved: 2026-03-29T19:15:00.447Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: APPLIES — docs/patterns.md updated with 'Global truths are live commit constraints' pattern including signal phrases. Signal phrases ('global truths are checked at commit time', 'why is the commit blocked by a truth') will be discoverable in behaviour.md step 1a pattern-check. Compliant. | resolved: 2026-03-29T19:15:00.159Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: APPLIES — enforcement note mentions 'when /tr-commit runs' to inform agents. The note does not instruct agents to commit; it informs them that truths are enforced at commit time. Follows commit-awareness guidance: the skill references /tr-commit as the authoritative commit path without duplicating commit logic. Compliant. | resolved: 2026-03-29T19:14:59.896Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: APPLIES — behaviour.md and implement.md modified. The enforcement note is a single sentence appended to the existing truth-loading step. (C-3) No cross-skill repetition beyond the two authoring skills. (C-4) Conditional on truths existing (no bulk pre-load). (C-5) Single sentence — no /compact trigger. Compliant. | resolved: 2026-03-29T19:14:59.626Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable — the enforcement note informs the agent but does not add a pause/confirm step. The existing contradiction surface (A/B/C choice) already handles user confirmation. Unchanged. | resolved: 2026-03-29T19:14:59.367Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable — the rework adds a note to an existing pre-draft step, not a new output-producing step or What's next? block. Existing What's next? blocks in behaviour.md and implement.md are unchanged. | resolved: 2026-03-29T19:14:59.105Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: APPLIES — behaviour.md and implement.md modified. Reviewed added enforcement note: 'These truths are automatically enforced at commit time by the commithook.' No Claude-specific names, no @{project-root} syntax, no agent-specific invocations. Compliant. | resolved: 2026-03-29T19:14:58.816Z

- condition: check-if-affected: examples/ | note: No examples exercise the truth-loading step directly. Not affected. | resolved: 2026-03-29T19:11:02.041Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — docs/patterns.md updated with 'Global truths are live commit constraints' pattern. | resolved: 2026-03-29T19:11:01.772Z

- condition: check-if-affected: skills/guide.md | note: guide.md lists user-facing slash commands. No new commands added — this rework adds a note to an existing step in behaviour.md and implement.md. Not affected. | resolved: 2026-03-29T19:11:01.477Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts copies skill files. skills/behaviour.md and skills/implement.md are modified — they will be correctly picked up by taproot update. No change to update.ts logic needed. | resolved: 2026-03-29T19:11:01.201Z

- condition: check-if-affected: package.json | note: No new dependencies. Prose-only changes to skills and docs/patterns.md. | resolved: 2026-03-29T19:11:00.924Z

- condition: document-current | note: AFFECTED AND UPDATED — docs/patterns.md: added 'Global truths are live commit constraints' pattern entry with enforcement explanation, signal phrases, and spec link. README.md does not enumerate skill step internals. docs/ accurately reflects the rework. | resolved: 2026-03-29T19:11:00.659Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Applies: intent.md, behaviour.md, implement.md, refine.md modified. Security review: no shell command execution in any injected step. No credentials or tokens hardcoded. Truth-loading step only reads from taproot/global-truths/ — minimal, scoped reads. No write operations in the injected step itself. Compliant. | resolved: 2026-03-26T15:19:21.082Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No new reusable pattern. The inline injection approach is specific to applying truths within authoring skills and not generalizable enough to document as a standalone pattern. | resolved: 2026-03-26T15:19:20.831Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No. apply-truths-when-authoring is itself the cross-cutting behaviour — it is now implemented by woven-in steps. No new check-if-affected-by condition is needed because the behavior is already injected directly into the authoring skills. | resolved: 2026-03-26T15:19:20.577Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Applies: reviewed docs/architecture.md. This implementation modifies four skills/*.md prose files — no TypeScript changes, no new CLI commands, no module boundary crossings. Filesystem-as-data-model preserved. Agent-agnostic output preserved. Stateless. Compliant. | resolved: 2026-03-26T15:19:09.097Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable: this implementation does not add any new patterns to docs/patterns.md. The inline injection approach is intentional and specific to authoring skills — not a reusable pattern for other implementations. | resolved: 2026-03-26T15:19:08.827Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable: the injected truth-loading steps contain no git commit instructions. None of the four modified skills add a new commit step. Commit awareness is unaffected. | resolved: 2026-03-26T15:19:08.572Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Applies: four existing skills are modified. (C-1) No new skill description added — not applicable. (C-2) Truth-loading steps reference only taproot/global-truths/ which is project content, not embedded reference docs. (C-3) No cross-skill repetition — the 5-line procedure appears once per skill at the appropriate injection point. (C-4) Truth files are read on demand only when global-truths/ exists (conditional step). (C-5) No new steps added to the skill step count that would require a /compact signal. (C-6) Existing What's next? blocks unchanged. Compliant. | resolved: 2026-03-26T15:19:08.318Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable: no new multi-document skills are introduced. The injected truth-loading step adds a single conditional read (no document written). pause-and-confirm applies to skills that write multiple documents per invocation — none of the four modified skills change their document-write count. | resolved: 2026-03-26T15:18:03.365Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable: this implementation does not add new skills or change the What's next? blocks of existing skills. The injected truth-loading steps are pre-draft procedure steps, not output-producing steps. Existing What's next? blocks in intent.md, behaviour.md, implement.md, and refine.md are unchanged. | resolved: 2026-03-26T15:18:03.106Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Applies: this implementation modifies skills/*.md files. Reviewed all four injected steps. No bare 'Claude' or 'Claude Code' references. No @{project-root} syntax. Language is generic and agent-agnostic. Compliant. | resolved: 2026-03-26T15:18:02.852Z

- condition: check-if-affected: examples/ | note: Not affected. Starter examples contain no authoring skill files and do not reference truth-loading behavior. No example files need updating. | resolved: 2026-03-26T15:17:50.972Z

- condition: check-if-affected: docs/ | note: Not affected. docs/workflows.md already documents the global truths workflow. No new CLI commands, no new slash commands. docs/cli.md and docs/concepts.md require no changes. docs/patterns.md: reviewed — the inline injection approach is not a reusable pattern (handled by the check: condition below). | resolved: 2026-03-26T15:17:50.719Z

- condition: check-if-affected: skills/guide.md | note: Not affected. skills/guide.md lists user-facing slash commands. apply-truths-when-authoring is not a new command — it is a pre-draft step added to existing skills. No new row in the slash commands table is warranted. | resolved: 2026-03-26T15:17:50.468Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. This implementation modifies only skills/*.md prose files. No new SKILL_FILES entry is needed — apply-truths-when-authoring is not a new registerable skill, it is cross-cutting behavior woven into existing skills. update.ts itself needs no changes. | resolved: 2026-03-26T15:17:50.218Z

