# Implementation: Agent Skill — Visual Language Sub-skill

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a pure agent skill markdown file (`skills/ux-visual.md`) — no new TypeScript commands. Consistent with all 9 sibling sub-skills; satisfies the intent constraint that module conventions require no core taproot source changes.
- Skill added to `MODULE_SKILL_FILES['user-experience']` in `init.ts`, not `SKILL_FILES` — it is a module sub-skill, not a standalone developer-callable command. This follows `conventions_impl.md`: "Only add a skill to SKILL_FILES if a developer would call it directly."
- Colour elicitation split into two questions (values first, then canonical token names) — token names are the primary deliverable for the agent checklist; treating them as optional (as in the original single question) would produce truth files that agents cannot apply consistently.
- Sweep offer appended to the write step — satisfies the parent intent success criterion: "After any module sub-skill writes a truth file, the developer is offered the option to run `/tr-sweep`."
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
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — one skill markdown file + one MODULE_SKILL_FILES array entry. Identical to all 9 sibling sub-skills. No new TypeScript modules or CLI commands. | resolved: 2026-04-12T12:09:36.653Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — visual/usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds are defined for this agent-driven elicitation behaviour. | resolved: 2026-04-12

## Status
- **State:** complete
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: document-current | note: AFFECTED AND UPDATED — docs/modules.md updated: description changed from 9 to 10 aspects, visual row added to sub-skills table. skills/guide.md updated: /tr-ux-visual added, /tr-ux-define count 9→10. README.md does not enumerate individual skills. | resolved: 2026-04-12T12:09:33.240Z
- condition: check-if-affected: package.json | note: NOT AFFECTED. No new npm dependencies. | resolved: 2026-04-12T12:09:33.522Z
- condition: check-if-affected: src/commands/update.ts | note: NOT DIRECTLY AFFECTED. update.ts iterates MODULE_SKILL_FILES from init.ts; new ux-visual.md picked up automatically. | resolved: 2026-04-12T12:09:33.801Z
- condition: check-if-affected: skills/guide.md | note: AFFECTED AND UPDATED. /tr-ux-visual row added; /tr-ux-define count 9→10. | resolved: 2026-04-12T12:09:34.083Z
- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED. docs/modules.md: 9→10 aspects, visual row added. | resolved: 2026-04-12T12:09:34.395Z
- condition: check-if-affected: examples/ | note: NOT AFFECTED. No examples exercise UX sub-skills. | resolved: 2026-04-12T12:09:34.677Z
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — ux-visual.md uses 'the agent'. No Claude-specific syntax. /tr-ux-visual is standard taproot convention. | resolved: 2026-04-12T12:09:34.948Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: COMPLIANT — ux-visual.md includes What's next block with 3 options. Suppressed when invoked from orchestrator. | resolved: 2026-04-12T12:09:35.224Z
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: COMPLIANT — [artifact-review] prompt before writing truth file ([A]/[B]/[C]). Single file write. | resolved: 2026-04-12T12:09:35.502Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — C-1: ~25 token description. C-2: no embedded docs. C-3: no repetition. C-4: on-demand reads only. C-5: hygiene signal before What's next. | resolved: 2026-04-12T12:09:35.791Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — ux-visual.md references /tr-commit in What's next only, does not instruct git commit. | resolved: 2026-04-12T12:09:36.098Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — ux-visual.md receives structured UX inputs, not natural-language requirements. Does not route requirements. | resolved: 2026-04-12T12:09:36.382Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — one new skill markdown file in skills/ + one filename appended to MODULE_SKILL_FILES in init.ts. Identical pattern to all 9 existing UX sub-skills. No new TypeScript modules, no CLI commands. All architectural constraints respected: agent-agnostic, stateless, project-agnostic. | resolved: 2026-04-12T11:26:41.753Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — follows established quality module pattern. Sweep offer satisfies existing intent SC, no new entry needed. | resolved: 2026-04-12T12:09:36.932Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — Quality module pattern already documented. This follows it. | resolved: 2026-04-12T12:09:37.211Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — no shell execution, no credentials, least-privilege writes (only to taproot/global-truths/ with dev confirmation). | resolved: 2026-04-12T12:09:37.481Z
- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: COMPLIANT — [artifact-review] pattern used. Canonical option letters: [A]/[B]/[C]/[S]. No raw rendering instructions. | resolved: 2026-04-12T12:09:37.753Z
