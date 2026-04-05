# Implementation: Agent Skill — /tr-audit interactive walkthrough

## Behaviour
../usecase.md

## Design Decisions
- Skill-only change: the audit skill is an agent prompt, not CLI code — the interactive walkthrough is implemented by rewriting the skill steps
- Challenge set (step 3) unchanged: generation phase stays the same, only presentation changes
- No batch progress persistence: audit findings are ephemeral within a session, not resumable — the `batch-skill-progress` pattern does not apply
- Proposed fix per finding: each finding must include a concrete change proposal so [A] Accept has unambiguous meaning for downstream `/tr-refine`

## Source Files
- `taproot/agent/skills/audit.md` — rewritten steps 4-6 for interactive walkthrough
- `skills/audit.md` — package source mirror

## Commits

## Tests
- `test/integration/audit-skill.test.ts` — verifies skill file contains triage prompt, proposed fix requirement, batch escape, and recommendation per finding

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: skill-only change (markdown prompt) — no TypeScript design decisions. Not applicable. | resolved: 2026-04-05T06:52:12.466Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: No NFR criteria in usecase. Audit walkthrough is a conversational flow with no measurable performance thresholds. Not applicable. | resolved: 2026-04-05T06:52:17.297Z

## Status
- **State:** in-progress
- **Created:** 2026-04-05
- **Last verified:** 2026-04-05

## Notes

