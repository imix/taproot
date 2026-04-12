# Implementation: Agent Skill — /tr-audit

## Behaviour
../usecase.md

## Design Decisions
- Skill-only implementation: the audit capability is an agent prompt, not CLI code — the challenge set, triage loop, and error handling are implemented as skill steps in `audit.md`
- The existing `audit.md` skill satisfies all 8 ACs without modification: challenge set per artefact type (AC-1), one-at-a-time triage (AC-2), accepted findings for refine (AC-3), batch escape (AC-4), defer to backlog (AC-5), triage summary (AC-6), stub detection (AC-7), no-findings path (AC-8)
- Interactive walkthrough UX is separately specced under `human-integration/interactive-audit/` — that spec covers the presentation model; this spec covers the overall audit capability; both are satisfied by the same skill file
- No persistence of findings across sessions: audit findings are ephemeral — resumability is out of scope per the advisory-only constraint in the intent

## Source Files
- `taproot/agent/skills/audit.md` — agent skill implementing the audit challenge set and interactive triage loop
- `skills/audit.md` — package source mirror

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/audit-skill.test.ts` — verifies skill file contains triage prompt, proposed fix requirement, batch escape, and recommendation-per-finding

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Skill-only change (markdown prompt) — no TypeScript design decisions to evaluate. Not applicable. | resolved: 2026-04-12
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: No NFR criteria in usecase — audit is a conversational interactive flow with no measurable performance thresholds. Not applicable. | resolved: 2026-04-12

## Status
- **State:** in-progress
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12
