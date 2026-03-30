# Implementation: Agent Skill — plan-execute

## Behaviour
../usecase.md

## Design Decisions
- **Agent skill, not CLI command**: execute-plan must invoke other skills (`/tr-behaviour`, `/tr-implement`, `/tr-refine`) and update `taproot/plan.md` after each outcome — these require agent reasoning and skill delegation. The implementation is a skill file.
- **Mode detection from natural language**: six modes (step-by-step, batch, hitl, afk, specify, implement) are inferred from the developer's request via a lookup of common phrasings, with step-by-step as default. No explicit `--mode` flag needed.
- **Orientation menu on bare invocation**: when no mode is specified, the agent reads plan.md, counts pending items by hitl/afk label, and presents a mode menu before executing anything. Explicit mode invocations skip the menu.
- **HITL/AFK filters are execution-mode-based**: hitl and afk modes filter by the item's execution mode label, not its type. A `[spec]` item labelled `afk` is included in afk mode; a `[implement]` item labelled `hitl` is included in hitl mode.
- **HITL items pause in batch**: when batch mode reaches a `hitl` item, execution pauses for confirmation before invoking the skill. AFK items proceed without interruption.
- **Follow-on offer after HITL completion**: when a `hitl` item of type `spec` or `refine` completes, the agent offers to append the corresponding `implement afk` item to plan.md. This closes the gap between specifying and scheduling implementation.
- **Filters compose with step-by-step/batch**: specify, implement, hitl, and afk modes filter the pending item list before the main execution loop. This keeps the flow simple.
- **Filtered-out items stay `pending`**: `skipped` implies developer intent to bypass; filtered items should be processed in a later pass. This enables the two-pass hitl→afk workflow.
- **Per-item presentation preserved in batch**: the spec is explicit that batch grants up-front confirmation but still shows each item as it executes. The agent presents then proceeds without waiting.
- **Skill slug `plan-execute`**: groups build/execute/analyse under the `plan-` namespace.

## Source Files
- `skills/plan-execute.md` — skill instructions (package source; synced to `taproot/agent/skills/plan-execute.md` by `taproot update`)
- `.claude/commands/tr-plan-execute.md` — Claude Code adapter

## Commits
- (run `taproot link-commits` to populate)
- `2b7a9f13ab428ef48b1ab1ec398512068003aaeb` — (auto-linked by taproot link-commits)
- `b71e6a014257089484a17da8fa29418aebe1b0d7` — (auto-linked by taproot link-commits)
- `96d414d943b128b8c249716b87a5054129f17f28` — (auto-linked by taproot link-commits)
- `fed5f4c25690fec4e10743950a09134cc9407bda` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/plan-execute.test.ts` — structural tests: required sections, no-plan guard, mode detection (4 modes), item presentation/confirmation, skill dispatch (3 types), status updates, batch confirmation, filter modes (specify/implement stay-pending behaviour)

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-03-30

## Notes
- 2026-03-30: updated step 6 batch list and step 7a item prompt to show behaviour title + one-line goal (AC-21)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill (markdown instruction file); no TypeScript source, no external I/O at unexpected boundaries, no global state; follows existing skill architecture pattern | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — execute-plan usecase.md contains only AC-N entries, no NFR-N performance criteria | resolved: 2026-03-27

## DoD Resolutions
- condition: check-if-affected: src/commands/update.ts | note: affected — added 'plan-execute.md' to SKILL_FILES array in src/commands/init.ts; consumed by update.ts via installSkills() so the new skill is picked up on taproot update | resolved: 2026-03-27
- condition: check-if-affected: package.json | note: Prose-only addition to skills/plan-execute.md — autonomous mode check woven into step 3. No new dependencies, no new CLI commands. package.json unchanged. | resolved: 2026-03-29T19:44:59.245Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — no shell execution added; no credentials or tokens; new orientation step reads plan.md (read-only); hitl/afk filtering and follow-on append are file writes to plan.md only; least-privilege maintained | resolved: 2026-03-28T06:23:55.290Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — orientation menu and hitl/afk filtering are specific to plan-execute; not a general pattern applicable across other skills | resolved: 2026-03-28T06:23:55.037Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — hitl/afk mode filtering is specific to plan-execute; not a cross-cutting architectural constraint | resolved: 2026-03-28T06:23:54.773Z

- condition: document-current | note: not affected — docs/agents.md already lists /tr-plan-execute with correct description; new hitl/afk modes and orientation are skill-internal behaviour; comprehensive doc update tracked as plan item 16 | resolved: 2026-03-28T06:23:44.317Z

- condition: check-if-affected: examples/ | note: not affected — examples demonstrate taproot hierarchy structure; plan.md and execution modes are runtime concerns not scaffolded in examples | resolved: 2026-03-28T06:23:44.050Z

- condition: check-if-affected: docs/ | note: not affected — docs/agents.md describes /tr-plan-execute at command level which is unchanged; new hitl/afk/orientation modes are internal skill behaviour details; doc update for plan feature is tracked as plan item 16 | resolved: 2026-03-28T06:23:43.782Z

- condition: check-if-affected: skills/guide.md | note: not affected — /tr-plan-execute entry already present in guide.md; no new command or changed signature | resolved: 2026-03-28T06:23:36.216Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files verbatim; content change picked up automatically on taproot update | resolved: 2026-03-28T06:23:35.960Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — updated skill uses generic language: 'the agent', 'hitl', 'afk'; no Claude-specific names; orientation step uses neutral [A]-[D][Q] prompts | resolved: 2026-03-28T06:23:35.706Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — What's next block unchanged; /tr-plan-execute and /tr-plan still offered as natural next steps | resolved: 2026-03-28T06:23:25.661Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — HITL items pause in batch mode (step 5 explicitly pauses for hitl items); orientation menu waits for mode selection; follow-on offer waits for [+] confirmation; no destructive action proceeds without confirmation | resolved: 2026-03-28T06:23:25.396Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — orientation step added (step 3a) but overall step count unchanged at 8; no embedded reference docs; on-demand plan.md read unchanged; /compact signal present; What's next block present | resolved: 2026-03-28T06:23:25.130Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-execute is an orchestration skill; it does not process user-expressed requirements directly; pattern checks run inside delegated skills | resolved: 2026-03-28T06:23:13.261Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-execute contains no git commit step; commit responsibility remains with delegated skills (/tr-implement, /tr-behaviour) | resolved: 2026-03-28T06:23:13.006Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source, no global state, no unexpected I/O; follows existing skill architecture pattern | resolved: 2026-03-28T06:23:12.741Z

- condition: document-current | note: docs/agents.md updated with /tr-plan and /tr-plan-execute rows in the slash commands table. taproot/agent/docs/workflows.md updated with /tr-plan-execute usage examples (step-by-step, batch, specify, implement modes) in the Planning section. | resolved: 2026-03-27T19:32:44.332Z

- condition: check-if-affected: skills/guide.md | note: affected — added /tr-plan-execute row to the slash commands table in skills/guide.md (and synced to taproot/agent/skills/guide.md) | resolved: 2026-03-27
- condition: check-if-affected: docs/ | note: not additionally affected — docs/workflows.md already references /tr-plan-execute in the existing plan-build section as the natural next step; no separate section needed for execute-plan as it is the downstream consumer | resolved: 2026-03-27
- condition: check-if-affected: examples/ | note: not affected — examples demonstrate taproot hierarchy structure; plan.md is a runtime artifact generated by the skill, not a hierarchy convention that examples should scaffold | resolved: 2026-03-27
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — skills/plan-execute.md uses generic language throughout: 'the agent', 'node dist/cli.js'; no Claude-specific names, no @{project-root} syntax (that belongs in .claude/commands/tr-plan-execute.md adapter), no CLAUDE.md references | resolved: 2026-03-27
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with a What's next? block offering /tr-plan-execute (to continue) and /tr-plan (to add more items) as natural next steps | resolved: 2026-03-27
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — step-by-step mode pauses after each item for [A]/[S]/[Q]; batch mode presents full list and waits for [A] Begin before executing; each item is presented before its skill is invoked even in batch mode | resolved: 2026-03-27
- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — C-1: description is ~30 words ✓; C-2: no embedded reference docs ✓; C-3: no cross-skill repetition ✓; C-4: plan.md read at step 2 on demand ✓; C-5: /compact signal present before What's next block ✓; C-6: What's next block present ✓; C-7: no always-loaded file additions ✓ | resolved: 2026-03-27
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-execute skill contains no git commit step; it delegates to /tr-implement and /tr-behaviour which handle their own commits; plan.md status updates are not committed by the skill | resolved: 2026-03-27
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-execute is an orchestration skill that dispatches to /tr-implement and /tr-behaviour; it does not process user-expressed requirements directly. Pattern checks run inside the delegated skills. | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source, no global state, no unexpected I/O; follows existing skill architecture pattern established by all other skills/*.md implementations | resolved: 2026-03-27
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — plan-execute introduces no new architectural constraint; it follows the agent-skill pattern and reuses the plan.md format established by plan-build | resolved: 2026-03-27
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the filter-then-execute pattern (specify/implement modes) is specific to multi-pass plan execution; it does not generalise to a pattern applicable across other skills | resolved: 2026-03-27
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — plan-execute.md instructs the agent to read taproot/plan.md and invoke other agent skills; no shell execution within the skill, no credentials or tokens, no filesystem access beyond reading plan.md and updating its status lines | resolved: 2026-03-27
