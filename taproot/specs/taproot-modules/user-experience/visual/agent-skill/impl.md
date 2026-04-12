# Implementation: Agent Skill — Visual Language Sub-skill

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a pure agent skill markdown file (`skills/ux-visual.md`) — no new TypeScript commands. Consistent with all 9 sibling sub-skills; satisfies the intent constraint that module conventions require no core taproot source changes.
- Skill added to `MODULE_SKILL_FILES['user-experience']` in `init.ts`, not `SKILL_FILES` — it is a module sub-skill, not a standalone developer-callable command. This follows `conventions_impl.md`: "Only add a skill to SKILL_FILES if a developer would call it directly."
- Colour elicitation split into two questions (values first, then canonical token names) — token names are the primary deliverable for the agent checklist; treating them as optional (as in the original single question) would produce truth files that agents cannot apply consistently.
- Sweep offer folded into the What's next block as option [1] — satisfies the parent intent success criterion: "After any module sub-skill writes a truth file, the developer is offered the option to run `/tr-sweep`." Originally a standalone step 7, which caused the agent to render both the sweep prompt and What's next simultaneously (duplicate menu); folding it into What's next resolves this.
- `ux-define.md` updated from 9 to 10 aspects — `visual` inserted after `consistency` in the sequence and coverage table.

## Source Files
- `skills/ux-visual.md` — visual sub-skill: scans for colour/icon/design-token patterns, elicits 8 targeted questions, writes `ux-visual_behaviour.md`, offers sweep
- `skills/ux-define.md` — orchestrator: adds `visual` as 10th aspect in input list, coverage scan, and Phase 2 sequence
- `src/commands/init.ts` — adds `ux-visual.md` to `MODULE_SKILL_FILES['user-experience']`
- `skills/guide.md` — adds `/tr-ux-visual` row; updates `/tr-ux-define` description from "9" to "10"

## Commits
- (run `taproot link-commits` to populate)
- `8b6c5e1437c6ef2bbb6057ba8731de7f19ee25b5` — (auto-linked by taproot link-commits)
- `ed02a04f4c5bf5247699ca6e023f93a22d1b90a5` — (auto-linked by taproot link-commits)

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions (`skill-architecture/context-engineering`, `agent-agnostic-language`, `portable-output-patterns`) that run at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — content-only fix to skills/ux-visual.md. No architectural changes. | resolved: 2026-04-12T16:34:15.276Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — visual/usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds are defined for this agent-driven elicitation behaviour. | resolved: 2026-04-12

## Status
- **State:** complete
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: document-current | note: AFFECTED AND UPDATED — docs/modules.md and skills/guide.md were updated in the original commit. The bug fix (sweep folded into What's next) changes only skills/ux-visual.md output format — no doc pages enumerate skill step numbering. No doc update needed for this rework. | resolved: 2026-04-12T16:34:11.903Z
- condition: check-if-affected: package.json | note: NOT AFFECTED. No new npm dependencies. | resolved: 2026-04-12T16:34:12.175Z
- condition: check-if-affected: src/commands/update.ts | note: NOT DIRECTLY AFFECTED. update.ts iterates MODULE_SKILL_FILES from init.ts; ux-visual.md change is content-only, no file rename. | resolved: 2026-04-12T16:34:12.445Z
- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED by this rework. guide.md lists /tr-ux-visual but does not describe step numbering or the sweep prompt. Content-only fix. | resolved: 2026-04-12T16:34:12.711Z
- condition: check-if-affected: docs/ | note: NOT AFFECTED by this rework. docs/modules.md describes the sub-skill purpose, not its step sequence. No doc update needed. | resolved: 2026-04-12T16:34:12.984Z
- condition: check-if-affected: examples/ | note: NOT AFFECTED. No examples exercise UX sub-skills. | resolved: 2026-04-12T16:34:13.258Z
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — no Claude-specific syntax introduced. Sweep moved into What's next as option [1]; language unchanged. | resolved: 2026-04-12T16:34:13.527Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — What's next now has 4 options. Sweep as option [1] is the natural first next step. Suppressed when invoked from orchestrator (same as before). | resolved: 2026-04-12T16:34:13.833Z
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — [artifact-review] prompt before writing truth file unchanged. Bug fix only changes the post-write output. | resolved: 2026-04-12T16:34:14.107Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — C-5: hygiene signal before What's next. Fix removes a redundant blocking prompt, reducing noise. No other C-N violations. | resolved: 2026-04-12T16:34:14.391Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — ux-visual.md references /tr-commit in What's next only, does not instruct git commit. | resolved: 2026-04-12T16:34:14.710Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — ux-visual.md receives structured UX inputs, not natural-language requirements. | resolved: 2026-04-12T16:34:14.978Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — one new skill markdown file in skills/ + one filename appended to MODULE_SKILL_FILES in init.ts. Identical pattern to all 9 existing UX sub-skills. No new TypeScript modules, no CLI commands. All architectural constraints respected: agent-agnostic, stateless, project-agnostic. | resolved: 2026-04-12T11:26:41.753Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — bug fix removes duplicate output. The fix pattern (fold blocking offer into What's next) is worth documenting in patterns.md, but does not warrant a new DoD gate. | resolved: 2026-04-12T16:34:15.554Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: YES — the fix reveals a pattern: never place a blocking offer step immediately before a What's next block; fold the offer into What's next as option [1] instead. Adding to patterns.md. | resolved: 2026-04-12T16:34:16.102Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — no shell execution, no credentials, no tokens. Change removes a step and adds an option to What's next only. | resolved: 2026-04-12T16:34:16.405Z
- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: COMPLIANT — [artifact-review] pattern unchanged. What's next format uses canonical numbered options. No raw rendering instructions. | resolved: 2026-04-12T16:34:16.768Z
