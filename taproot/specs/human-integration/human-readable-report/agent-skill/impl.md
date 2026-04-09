# Implementation: Agent Skill — /tr-status

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill that combines multiple CLI commands rather than as a single CLI command — the synthesis, prioritization, and narrative framing benefit from agent reasoning
- The skill defines a fixed output format with clear sections (Validation, Coverage, What's Working, What Needs Attention, Parked, Suggested Next Actions) so the report is predictable and skimmable
- Parked section sources from `deferredBehaviours`/`deferredImpls` in coverage JSON; omitted entirely when both are zero so the report stays clean for projects with no deferred items

## Source Files
- `skills/status.md` — full skill definition including report format and prioritization rules

## Commits
- (run `taproot link-commits` to populate)
- `f06f838328680e3b8116931e226baa9f63cd6d23` — (auto-linked by taproot link-commits)
- `851ad3963e81f6034c44923547ec9406d65af8b9` — (auto-linked by taproot link-commits)
- `11527cc344aa3d95ae1a6e136b70d4c11b2cb7de` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — validates skill file format, required sections, and Parked section content (AC-1: deferredBehaviours/deferredImpls referenced, ## Parked template present; AC-2: omit-when-zero instruction present)

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: skills/status.md updated with Parked section in report template; guide.md describes /tr-status at a high level only (no report sections listed) — no change needed; docs/agents.md lists /tr-status as a coverage dashboard — no section-level detail to update | resolved: 2026-03-20T18:33:53.194Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Reviewed skills/status.md: no shell command execution introduced; no credentials or tokens; steps 5 and 6 instruct the agent to read files conditionally — least-privilege, read-only access only. | resolved: 2026-03-31T11:17:33.172Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No — adding backlog and plan summary to one skill's report is not a cross-cutting concern; no new settings.yaml entry needed. | resolved: 2026-03-31T11:17:26.172Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — tr-status is a read-only reporting skill; it contains no commit step or declaration logic. | resolved: 2026-03-31T11:16:36.366Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Compliant — skill prose uses agent-agnostic language; no framework-specific terms introduced. | resolved: 2026-03-31T11:16:26.633Z

- condition: check-if-affected: examples/ | note: Not affected — no status report examples exist in examples/. | resolved: 2026-03-31T11:16:17.976Z

- condition: check-if-affected: docs/ | note: Not affected — docs/ contains no section-level description of the /tr-status report format; no change needed. | resolved: 2026-03-31T11:16:17.707Z

- condition: check-if-affected: package.json | note: Not affected — skills/status.md is a markdown skill file; no new CLI commands, dependencies, or scripts added. | resolved: 2026-03-31T11:16:10.202Z

- condition: document-current: README.md and docs/ accurately reflect all currently implemented CLI commands, skills, and configuration options | note: skills/status.md is the authoritative doc for /tr-status; README.md lists /tr-status as a health dashboard command without enumerating sections — no change needed. docs/ contains no section-level description of the status report. | resolved: 2026-03-31T11:16:03.198Z

- condition: tests-passing | note: Pre-existing test failures unrelated to this change: 2 in sweep.md (AC-4 taproot path, tr-review-all redirect) and 14 in design-constraints.test.ts — all confirmed present before this commit via git stash. Our 6 new AC-3/AC-4 tests in skills.test.ts pass. | resolved: 2026-03-31T11:18:48.572Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No — reading backlog.md and plan.md in a status report is specific behaviour, not a reusable pattern. | resolved: 2026-03-31T11:17:26.497Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — Parked section is a reporting addition to one skill; not a cross-cutting enforcement concern | resolved: 2026-03-20T18:33:55.063Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant — change is markdown-only (skills/status.md); no source code modified; no architectural constraints affected. | resolved: 2026-03-31T11:17:25.893Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable — pattern-hints applies to skills processing natural language requirements; tr-status processes CLI command output. | resolved: 2026-03-31T11:16:36.645Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Compliant — status.md loads CLI output on-demand via explicit taproot commands; backlog.md and plan.md are read conditionally (step 5 and 6); description remains concise; /compact signal present in skill footer. | resolved: 2026-03-31T11:16:36.091Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable — tr-status is read-only; it produces a single report and does not write multiple documents in sequence. | resolved: 2026-03-31T11:16:27.185Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant — status.md already ends with a What's next? block. Backlog/plan are new report sections, not output endpoints; no change to the What's next? structure required. | resolved: 2026-03-31T11:16:26.914Z

- condition: check-if-affected: skills/guide.md | note: Not affected — guide.md lists /tr-status as a health dashboard command but does not enumerate report sections; backlog/plan additions require no onboarding guide change. | resolved: 2026-03-31T11:16:17.430Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected — update.ts copies skill files to agent adapter dirs; the backlog/plan additions to status.md are propagated via the CLAUDE.md copy-back step (skills/ → taproot/agent/skills/), not via update.ts. | resolved: 2026-03-31T11:16:10.461Z
- condition: document-current | note: skills/status.md step 1 updated to explicitly name deferredBehaviours and deferredImpls JSON fields for Parked section population; no other docs require updating | resolved: 2026-03-20T19:00:00.000Z

