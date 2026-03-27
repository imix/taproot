# Implementation: Agent Skill — plan-build

## Behaviour
../usecase.md

## Design Decisions
- **Agent skill, not CLI command**: build-plan requires agent reasoning (classify backlog items, infer dependencies, present and await confirmation) — these are not deterministic CLI operations. The implementation is a skill file.
- **plan.md format**: numbered list with inline `pending|done|skipped|blocked|stale` status, item type in brackets (`[spec]|[implement]|[refine]`), then path or description. Human-readable and regex-parseable by execute-plan and analyse-plan skills.
- **Skill slug `plan-build`**: groups build/execute/analyse under the `plan-` namespace, distinct from the existing `plan.md` skill (extract-next-slice). Adapter: `/tr-plan-build`.
- **Backlog items not removed**: after being added to the plan, items stay in `taproot/backlog.md` — the backlog is a record, the plan is an execution list. Avoids destructive mid-session edits.
- **Existing plan check at write time**: the agent checks for `taproot/plan.md` only after the developer confirms the proposed plan (step 7), not before collection and classification. Avoids interrupting the discovery phase.

## Source Files
- `skills/plan-build.md` — skill instructions (package source; synced to `taproot/agent/skills/plan-build.md` by `taproot update`)
- `.claude/commands/tr-plan-build.md` — Claude Code adapter

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/plan-build.test.ts` — structural tests: required sections present, item types documented, plan.md format documented, what's-next block present, append/replace/abort flows present

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill (markdown instruction file); no TypeScript source, no external I/O at unexpected boundaries, no global state; follows existing skill architecture pattern | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — build-plan usecase.md contains only AC-N entries, no NFR-N performance criteria | resolved: 2026-03-27

## DoD Resolutions
- condition: document-current | note: docs/workflows.md updated with new '## Planning a sprint or batch of work' section documenting /tr-plan-build usage. skills/guide.md updated to include /tr-plan-build in the slash commands table. docs/cli.md already covers taproot plan CLI; no CLI command added. | resolved: 2026-03-27T19:08:32.698Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — plan-build.md instructs the agent to run 'node dist/cli.js coverage' (read-only CLI command) and write taproot/plan.md; no shell execution beyond the controlled CLI call, no credentials or tokens, no excessive filesystem access beyond the plan file | resolved: 2026-03-27T19:10:06.555Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the plan.md format and workflow are specific to implementation planning; the skill itself follows the existing agent-skill pattern already documented in patterns.md | resolved: 2026-03-27T19:09:58.444Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — plan-build introduces the plan.md file format, but this is a developer-facing artifact not an architectural constraint that all implementations must satisfy | resolved: 2026-03-27T19:09:58.191Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure agent skill file; no TypeScript source, no global state, no unexpected I/O; follows existing skill architecture pattern established by all other skills/*.md implementations | resolved: 2026-03-27T19:09:51.467Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — plan-build is an orchestration skill that coordinates the planning workflow; it does not process user-expressed requirements or route new needs. Individual items delegated to /tr-behaviour and /tr-implement each run the pattern check themselves on the actual requirement descriptions. | resolved: 2026-03-27T19:09:51.215Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — plan-build skill contains no git commit step; it writes taproot/plan.md but does not commit anything; commit step is the developer's responsibility after review | resolved: 2026-03-27T19:09:45.338Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — C-1: description is ~25 words/40 tokens ✓; C-2: no embedded reference docs ✓; C-3: no cross-skill repetition ✓; C-4: files read on demand (backlog in step 2, coverage in step 2) ✓; C-5: /compact signal present before What's next block (skill has 9 steps) ✓; C-6: What's next block present ✓; C-7: no always-loaded file additions ✓ | resolved: 2026-03-27T19:09:45.086Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: compliant — skill presents proposed plan and waits for [A] Confirm before writing; also checks for existing plan.md and offers Append/Replace/Abort before overwriting | resolved: 2026-03-27T19:09:21.377Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with a What's next? block offering /tr-plan-analyse and /tr-plan-execute as the natural next steps after plan is built | resolved: 2026-03-27T19:09:21.126Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — skills/plan-build.md uses generic language throughout: 'the agent', 'node dist/cli.js coverage'; no Claude-specific names, no @{project-root} syntax (that belongs in .claude/commands/tr-plan-build.md adapter), no CLAUDE.md references | resolved: 2026-03-27T19:08:49.576Z

- condition: check-if-affected: examples/ | note: not affected — examples demonstrate taproot hierarchy structure; plan.md is a runtime artifact generated by the skill, not a hierarchy convention that examples should scaffold | resolved: 2026-03-27T19:08:44.374Z

- condition: check-if-affected: docs/ | note: affected — docs/workflows.md updated with new planning workflow section documenting /tr-plan-build. No CLI reference doc update needed (plan-build is a skill, not a CLI command). | resolved: 2026-03-27T19:08:44.119Z

- condition: check-if-affected: skills/guide.md | note: affected — added /tr-plan-build row to the slash commands table in skills/guide.md (and synced to taproot/agent/skills/guide.md) | resolved: 2026-03-27T19:08:39.025Z

- condition: check-if-affected: src/commands/update.ts | note: affected — added 'plan-build.md' to SKILL_FILES array in src/commands/init.ts; this is consumed by update.ts via installSkills() so the new skill is picked up on taproot update | resolved: 2026-03-27T19:08:38.776Z

