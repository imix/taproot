# Implementation: Agent Skill — plan-execute

## Behaviour
../usecase.md

## Design Decisions
- **Agent skill, not CLI command**: execute-plan must invoke other skills (`/tr-behaviour`, `/tr-implement`, `/tr-refine`) and update `taproot/plan.md` after each outcome — these require agent reasoning and skill delegation. The implementation is a skill file.
- **Mode detection from natural language**: six modes (step-by-step, batch, hitl, afk, specify, implement) are inferred from the developer's request via a lookup of common phrasings, with step-by-step as default. No explicit `--mode` flag needed.
- **Orientation menu on bare invocation**: when no mode is specified, the agent reads plan.md, counts pending items by hitl/afk label, and presents a mode menu before executing anything. Explicit mode invocations skip the menu.
- **HITL/AFK filters are execution-mode-based**: hitl and afk modes filter by the item's execution mode label, not its type. A `[spec]` item labelled `afk` is included in afk mode; a `[implement]` item labelled `hitl` is included in hitl mode.
- **HITL always step-by-step**: HITL items require human decisions during execution — batch is meaningless. HITL mode always runs step-by-step.
- **AFK always batch**: the whole point of `afk` items is autonomous execution. AFK mode presents the list once for confirmation, then runs all items without per-item prompts.
- **Batch pauses on HITL items**: when batch mode (all items) reaches a `hitl` item, execution pauses for confirmation. AFK items proceed without interruption.
- **Follow-on offer after spec/refine completion**: when an item of type `spec` or `refine` completes, the agent offers to append an `implement afk` item to plan.md — but only if no implement item for the same path already exists. Triggered by item type, not execution mode (hitl/afk). This closes the gap between specifying and scheduling implementation.
- **Filters compose with execution style**: specify and implement modes filter by item type; hitl and afk modes filter by label and fix the execution style (step-by-step and batch respectively).
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
- `c2d99b64bbbd61de5b2287ffcd6c04eb45f6d908` — (auto-linked by taproot link-commits)
- `8e3b28ccc822a6373d068bc9f99321d8746fc71e` — (auto-linked by taproot link-commits)
- `f0f0cc92f6d16bd2af55cfbccc918848cfaf87a7` — (auto-linked by taproot link-commits)
- `6cab1e0523cf4fe32cd8d945efccf26c95689835` — (auto-linked by taproot link-commits)
- `7e02cce00d074c22f7e7e4281fd05692c4c6f9b4` — (auto-linked by taproot link-commits)
- `890a20911b15262104a6a076316d51174177c941` — (auto-linked by taproot link-commits)
- `741f820da8dd164f5ea479261006c462825500be` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/plan-execute.test.ts` — structural tests: required sections, no-plan guard, mode detection (4 modes), item presentation/confirmation, skill dispatch (3 types), status updates, batch confirmation, filter modes (specify/implement stay-pending behaviour)

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-04-09

## Notes
- 2026-03-30: updated step 6 batch list and step 7a item prompt to show behaviour title + one-line goal (AC-21)
- 2026-03-30: added [R] Review spec as first HITL option in step 7a/7b — invokes /tr-browse and re-presents item (AC-22)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript, no global state | resolved: 2026-04-03T05:57:03.315Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — execute-plan usecase.md contains only AC-N entries, no NFR-N performance criteria | resolved: 2026-03-27

## DoD Resolutions
- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files verbatim; content change picked up automatically on taproot update | resolved: 2026-04-03T05:55:29.084Z
- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: compliant — step 7f adds new completion prompts using the same fenced-block declaration style as existing skill content; no raw rendering instructions ('print the full', 'display the contents'), no adapter-specific language; prompt content declares what to present (options, confirmation text), not how to render it | resolved: 2026-04-11T06:23:53.243Z

- condition: check-if-affected: package.json | note: not applicable — prose-only impl (Source Files: skills/plan-execute.md, .claude/commands/tr-plan-execute.md); no TypeScript or other non-markdown files; auto-resolved by naRules[when:prose-only] | resolved: 2026-04-02T21:41:10.874Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — changes only affect mode selection logic and notes; no shell execution, no credentials, no elevated permissions | resolved: 2026-04-03T05:57:14.403Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — mode/filter orthogonality is specific to plan-execute, not a general pattern | resolved: 2026-04-03T05:57:14.123Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — execution style semantics are specific to plan-execute | resolved: 2026-04-03T05:57:13.803Z

- condition: document-current | note: docs/agents.md lists /tr-plan-execute correctly; mode execution semantics are skill-internal behaviour documented in the skill file itself. No docs update needed. | resolved: 2026-04-03T05:55:28.776Z

- condition: check-if-affected: examples/ | note: not affected — examples demonstrate hierarchy structure; execution modes are runtime skill behaviour | resolved: 2026-04-03T05:55:29.919Z

- condition: check-if-affected: docs/ | note: not affected — mode semantics are internal skill behaviour; docs/agents.md description unchanged | resolved: 2026-04-03T05:55:29.652Z

- condition: check-if-affected: skills/guide.md | note: not affected — /tr-plan-execute entry already present; no new command or changed signature | resolved: 2026-04-03T05:55:29.377Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files verbatim; content change picked up automatically on taproot update | resolved: 2026-03-28T06:23:35.960Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — skill uses generic language: 'the agent', 'hitl', 'afk'; no Claude-specific names | resolved: 2026-04-03T05:57:01.459Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — What's next block unchanged | resolved: 2026-04-03T05:57:01.734Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — HITL items always step-by-step (pause per item); AFK batch has upfront list confirmation; batch mode pauses on HITL items | resolved: 2026-04-03T05:57:02.066Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — no new sections or embedded docs; step count unchanged; /compact signal present | resolved: 2026-04-03T05:57:02.421Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-execute is orchestration; does not process requirements directly | resolved: 2026-04-03T05:57:02.974Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-execute delegates commits to /tr-commit; no direct git commit step | resolved: 2026-04-03T05:57:02.700Z

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
