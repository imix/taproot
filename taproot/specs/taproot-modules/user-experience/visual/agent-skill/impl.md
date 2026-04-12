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

## Tests
- No new TypeScript unit tests. Skill files are agent-executed markdown; correctness is verified through DoD conditions (`skill-architecture/context-engineering`, `agent-agnostic-language`, `portable-output-patterns`) that run at commit time.

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — implementation adds one skill markdown file to skills/ and one filename to MODULE_SKILL_FILES in init.ts. This is the identical pattern used for all 9 existing UX sub-skills. No new TypeScript modules, no CLI commands, no external I/O patterns. All architectural constraints respected: agent-agnostic output, stateless, project-agnostic. | resolved: 2026-04-12
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — visual/usecase.md contains no NFR-N entries. No performance, security, or reliability thresholds are defined for this agent-driven elicitation behaviour. | resolved: 2026-04-12

## Status
- **State:** in-progress
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12
