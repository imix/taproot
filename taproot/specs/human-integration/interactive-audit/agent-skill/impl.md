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
- `3a9a5d3b2895f5185af1ecdc079182e3a460cfc2` — (auto-linked by taproot link-commits)
- `33b3360fd15b59f0866d086491f6de821b840019` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/audit-skill.test.ts` — verifies skill file contains triage prompt, proposed fix requirement, batch escape, and recommendation per finding

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Skill-only change (markdown prompt) — no TypeScript design decisions. Not applicable. | resolved: 2026-04-05T07:01:41.252Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: No NFR criteria in usecase. Audit walkthrough is a conversational flow with no measurable performance thresholds. Not applicable. | resolved: 2026-04-05T06:52:17.297Z

## Status
- **State:** complete
- **Created:** 2026-04-05
- **Last verified:** 2026-04-05

## Notes

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Skill-only change (markdown prompt) — no TypeScript design decisions. Not applicable. | resolved: 2026-04-05T06:59:33.360Z
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Compliant — generic agent language, no agent-specific terminology. | resolved: 2026-04-05T07:01:43.216Z
- condition: document-current | note: audit skill exists in both README and docs/agents.md. UX change is internal — no doc update needed. | resolved: 2026-04-05T07:01:41.522Z

- condition: check-if-affected: examples/ | note: Not affected — examples do not reference audit internals. | resolved: 2026-04-05T07:01:42.935Z

- condition: check-if-affected: docs/ | note: Not affected — audit skill UX not documented in docs/. | resolved: 2026-04-05T07:01:42.654Z

- condition: check-if-affected: skills/guide.md | note: Not affected — audit already listed. Behaviour changed, not name or trigger. | resolved: 2026-04-05T07:01:42.352Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected — audit.md already in SKILL_FILES. | resolved: 2026-04-05T07:01:42.076Z

- condition: check-if-affected: package.json | note: Not affected — no new CLI commands or dependencies. Skill file change only. | resolved: 2026-04-05T07:01:41.798Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Verified — read-only skill, no shell commands, no credentials. | resolved: 2026-04-05T07:01:45.465Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No — application of existing pause-and-confirm pattern. | resolved: 2026-04-05T07:01:45.198Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No — specific to audit skill. | resolved: 2026-04-05T07:01:44.927Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not affected — review skill, not creation skill. | resolved: 2026-04-05T07:01:44.658Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not affected — read-only analysis skill. | resolved: 2026-04-05T07:01:44.386Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Compliant — step 2 reads parent and siblings. | resolved: 2026-04-05T07:01:44.106Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Compliant — walkthrough IS pause-and-confirm applied to findings. | resolved: 2026-04-05T07:01:43.778Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant — step 7 has What's next menu. | resolved: 2026-04-05T07:01:43.503Z

