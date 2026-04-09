# Implementation: Agent Skill — plan

## Behaviour
../usecase.md

## Design Decisions
- **Agent skill, not CLI command**: build-plan requires agent reasoning (classify backlog items, infer dependencies, present and await confirmation) — these are not deterministic CLI operations. The implementation is a skill file.
- **plan.md format**: numbered list with inline `pending|done|skipped|blocked|stale` status, item type in brackets (`[spec]|[implement]|[refine]`), `hitl|afk` execution mode, then path or description. Header includes legend. Human-readable and regex-parseable by execute-plan and analyse-plan skills.
- **HITL/AFK heuristics**: `spec` → `hitl` (design decisions needed); `refine` → `hitl` (human confirmation required); `implement` → `afk` by default unless known external blockers or unresolved design questions exist. Agent reasons per-item — heuristics are defaults, not rules.
- **Skill slug `plan`**: groups build/execute/analyse under the `plan-` namespace, distinct from the existing `next.md` skill (extract-next-slice). Adapter: `/tr-plan`.
- **Backlog items removed after plan write**: after `taproot/plan.md` is written, consumed backlog items are deleted from `taproot/backlog.md` and the count is reported. Removal is scoped to backlog-sourced items only — explicit and hierarchy items have no backlog entry. The removal is reported inline so the developer is never surprised (aligns with UX "No Surprises" truth).
- **Existing plan check at write time**: the agent checks for `taproot/plan.md` only after the developer confirms the proposed plan (step 7), not before collection and classification. Avoids interrupting the discovery phase.
- **Vertical slice as step 0a**: placed between modification detection (step 0) and the standard source-scanning flow (step 1). It is a self-contained alternate path — asks for actor/entry/outcome, scans for critical-path items only, writes the plan with a slice header, and stops. Non-critical-path behaviours are excluded entirely (not added as deferred items). The same HITL/AFK heuristics and existing-plan prompts apply within slice mode for consistency.

## Source Files
- `skills/plan.md` — skill instructions (package source; synced to `taproot/agent/skills/plan.md` by `taproot update`)
- `.claude/commands/tr-plan.md` — Claude Code adapter

## Commits
- (run `taproot link-commits` to populate)
- `a0f6f28b5f07527a356efb858f326dde0776c9ab` — (auto-linked by taproot link-commits)
- `d9abca638cfbf193b5b8cc1ab18fcdd68a2ebcde` — (auto-linked by taproot link-commits)
- `bab36a92f9c991bd32ad5d8764aab62ed7e205a8` — (auto-linked by taproot link-commits)
- `b2adc103b5cb12ef56c2248b73ae5e31d1251217` — (auto-linked by taproot link-commits)
- `074588e320365343d323f0af0112694f11ef952e` — (auto-linked by taproot link-commits)
- `59b9612257bf8cc7b66ef1ceb5843723d249abf1` — (auto-linked by taproot link-commits)
- `0fa2f57cd5af463a400af7770dfbaca358963d65` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/plan-build.test.ts` — structural tests: required sections present, item types documented, plan.md format documented, what's-next block present, append/replace/abort flows present, vertical slice mode (AC-11): trigger phrases, actor/entry/outcome prompts, critical-path filtering, slice header format

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill (markdown instruction file); no TypeScript source, no external I/O at unexpected boundaries, no global state; follows existing skill architecture pattern | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — build-plan usecase.md contains only AC-N entries, no NFR-N performance criteria | resolved: 2026-03-27

## DoD Resolutions
- condition: document-current | note: docs/workflows.md updated with new '## Planning a sprint or batch of work' section documenting /tr-plan usage. skills/guide.md updated to include /tr-plan in the slash commands table. docs/cli.md already covers taproot plan CLI; no CLI command added. | resolved: 2026-03-27T19:08:32.698Z
- condition: tests-passing | note: 34/34 tests pass in test/integration/plan-build.test.ts — verified by running npx vitest run test/integration/plan-build.test.ts directly | resolved: 2026-03-30T21:42:27.788Z

- condition: check-if-affected: package.json | note: No new npm dependencies added. Change is description text and a new step 0 in skills/plan.md (markdown only). package.json unchanged. | resolved: 2026-03-30T10:15:48.249Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — no shell execution added; no credentials; new classification step reasons about item descriptions only | resolved: 2026-03-28T05:52:47.721Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — HITL/AFK labelling is specific to plan-build; the concept is documented in the skill and spec | resolved: 2026-03-28T05:52:47.466Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — HITL/AFK classification is specific to plan-build output format; not a cross-cutting architectural constraint | resolved: 2026-03-28T05:52:47.185Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source; follows existing skill architecture pattern | resolved: 2026-03-28T05:52:46.904Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-build is an orchestration skill; does not process user-expressed requirements | resolved: 2026-03-28T05:52:46.640Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-build does not commit anything | resolved: 2026-03-28T05:52:46.383Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — step count unchanged (10); no embedded docs; on-demand file reads unchanged; /compact signal present | resolved: 2026-03-28T05:52:46.126Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — plan still presented for [A] Confirm before writing; no new destructive action added | resolved: 2026-03-28T05:52:45.868Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — What's next? block unchanged; /tr-plan-analyse and /tr-plan-execute still offered | resolved: 2026-03-28T05:52:45.606Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — skill uses generic language: 'the agent', 'hitl', 'afk'; no Claude-specific names | resolved: 2026-03-28T05:52:45.343Z

- condition: check-if-affected: examples/ | note: not affected — examples scaffold hierarchy structure; plan.md format is a runtime artifact | resolved: 2026-03-28T05:52:45.087Z

- condition: check-if-affected: docs/ | note: not affected — HITL/AFK classification is a skill-internal behaviour; no new CLI commands or config options to document | resolved: 2026-03-28T05:52:44.824Z

- condition: check-if-affected: skills/guide.md | note: not affected — /tr-plan entry already present; no new command or changed signature | resolved: 2026-03-28T05:52:44.569Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files verbatim; content change picked up automatically | resolved: 2026-03-28T05:52:44.311Z

- condition: document-current | note: not affected — no new CLI commands or config options; docs/agents.md describes /tr-plan at command level which is unchanged; HITL/AFK is an internal classification detail | resolved: 2026-03-28T05:52:44.053Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — new step 9 instructs the agent to edit taproot/backlog.md (file write only); no shell execution, no credentials, no tokens; least-privilege maintained | resolved: 2026-03-27T21:19:43.179Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — backlog cleanup on plan write is specific to plan-build; not a reusable cross-skill pattern | resolved: 2026-03-27T21:19:42.917Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — this is a behaviour fix to an existing skill; no new cross-cutting concern introduced | resolved: 2026-03-27T21:19:42.658Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source; follows existing skill architecture pattern | resolved: 2026-03-27T21:19:42.398Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-build is an orchestration skill; it does not process user-expressed requirements | resolved: 2026-03-27T21:19:42.139Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-build does not commit anything; commit step remains developer's responsibility | resolved: 2026-03-27T21:19:41.884Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — step count increased by 1 (to 10); still within /compact signal threshold; no embedded reference docs added; on-demand file reads unchanged | resolved: 2026-03-27T21:19:41.623Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — backlog removal happens after plan.md is written and developer has already confirmed; no additional destructive action requires a second confirmation | resolved: 2026-03-27T21:19:41.357Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — What's next? block unchanged; /tr-plan-analyse and /tr-plan-execute still offered as next steps | resolved: 2026-03-27T21:19:41.099Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — updated skill uses generic language: 'the agent', 'taproot/backlog.md'; no Claude-specific names or @{project-root} syntax | resolved: 2026-03-27T21:19:40.844Z

- condition: check-if-affected: examples/ | note: not affected — examples scaffold hierarchy structure; plan-build skill behaviour change does not affect example content | resolved: 2026-03-27T21:19:11.668Z

- condition: check-if-affected: docs/ | note: not affected — docs/agents.md describes the skill at command level; the backlog removal is an internal step detail not surfaced in docs | resolved: 2026-03-27T21:19:11.414Z

- condition: check-if-affected: skills/guide.md | note: not affected — /tr-plan entry already present in guide.md; no new command or changed signature | resolved: 2026-03-27T21:19:11.159Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files verbatim; the skill content change is picked up automatically on taproot update | resolved: 2026-03-27T21:19:10.904Z

- condition: document-current | note: docs/agents.md already lists /tr-plan with correct description; no CLI or config change — skill behaviour update only; no docs update needed | resolved: 2026-03-27T21:19:10.656Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — plan-build.md instructs the agent to run 'node dist/cli.js coverage' (read-only CLI command) and write taproot/plan.md; no shell execution beyond the controlled CLI call, no credentials or tokens, no excessive filesystem access beyond the plan file | resolved: 2026-03-27T19:10:06.555Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the plan.md format and workflow are specific to implementation planning; the skill itself follows the existing agent-skill pattern already documented in patterns.md | resolved: 2026-03-27T19:09:58.444Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — plan-build introduces the plan.md file format, but this is a developer-facing artifact not an architectural constraint that all implementations must satisfy | resolved: 2026-03-27T19:09:58.191Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source, no global state, no unexpected I/O; follows existing skill architecture pattern established by all other skills/*.md implementations | resolved: 2026-03-27T19:09:51.467Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-build is an orchestration skill that coordinates the planning workflow; it does not process user-expressed requirements or route new needs. Individual items delegated to /tr-behaviour and /tr-implement each run the pattern check themselves on the actual requirement descriptions. | resolved: 2026-03-27T19:09:51.215Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-build skill contains no git commit step; it writes taproot/plan.md but does not commit anything; commit step is the developer's responsibility after review | resolved: 2026-03-27T19:09:45.338Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — C-1: description is ~25 words/40 tokens ✓; C-2: no embedded reference docs ✓; C-3: no cross-skill repetition ✓; C-4: files read on demand (backlog in step 2, coverage in step 2) ✓; C-5: /compact signal present before What's next block (skill has 9 steps) ✓; C-6: What's next block present ✓; C-7: no always-loaded file additions ✓ | resolved: 2026-03-27T19:09:45.086Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — skill presents proposed plan and waits for [A] Confirm before writing; also checks for existing plan.md and offers Append/Replace/Abort before overwriting | resolved: 2026-03-27T19:09:21.377Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with a What's next? block offering /tr-plan-analyse and /tr-plan-execute as the natural next steps after plan is built | resolved: 2026-03-27T19:09:21.126Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — skills/plan.md uses generic language throughout: 'the agent', 'node dist/cli.js coverage'; no Claude-specific names, no @{project-root} syntax (that belongs in .claude/commands/tr-plan.md adapter), no CLAUDE.md references | resolved: 2026-03-27T19:08:49.576Z

- condition: check-if-affected: examples/ | note: not affected — examples demonstrate taproot hierarchy structure; plan.md is a runtime artifact generated by the skill, not a hierarchy convention that examples should scaffold | resolved: 2026-03-27T19:08:44.374Z

- condition: check-if-affected: docs/ | note: affected — docs/workflows.md updated with new planning workflow section documenting /tr-plan. No CLI reference doc update needed (plan-build is a skill, not a CLI command). | resolved: 2026-03-27T19:08:44.119Z

- condition: check-if-affected: skills/guide.md | note: affected — added /tr-plan row to the slash commands table in skills/guide.md (and synced to taproot/agent/skills/guide.md) | resolved: 2026-03-27T19:08:39.025Z

- condition: check-if-affected: src/commands/update.ts | note: affected — added 'plan-build.md' to SKILL_FILES array in src/commands/init.ts; this is consumed by update.ts via installSkills() so the new skill is picked up on taproot update | resolved: 2026-03-27T19:08:38.776Z

