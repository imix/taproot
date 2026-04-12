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
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Skill-only (markdown prompt) — no TypeScript design decisions. Not applicable. | resolved: 2026-04-12T13:48:42.642Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: No NFR criteria in usecase — audit is a conversational interactive flow with no measurable performance thresholds. Not applicable. | resolved: 2026-04-12

## Status
- **State:** complete
- **Created:** 2026-04-12
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: document-current | note: Audit skill already documented in docs/agents.md, docs/workflows.md, and skills/guide.md. Declaration-only — no new user-facing capability added. | resolved: 2026-04-12T13:48:39.014Z
- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: Plain markdown output with labelled triage prompts [A][X][E][L] — no IDE-specific syntax. Compliant. | resolved: 2026-04-12T13:48:43.881Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: No skill file modified — declaration only. Existing audit.md is read-only, no shell commands, no credentials. Compliant. | resolved: 2026-04-12T13:48:43.549Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No — audit pattern already established; this is traceability work. | resolved: 2026-04-12T13:48:43.206Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No — declaration of existing skill. No new cross-cutting concern. | resolved: 2026-04-12T13:48:42.923Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Review skill, not a creation skill. Not applicable. | resolved: 2026-04-12T13:48:42.365Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Read-only analysis skill — does not commit. Not applicable. | resolved: 2026-04-12T13:48:42.078Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Step 2 reads artifact, parent, and siblings. Compliant. | resolved: 2026-04-12T13:48:41.773Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: One finding at a time with [A][X][E][L] triage — direct application of pause-and-confirm. Compliant. | resolved: 2026-04-12T13:48:41.476Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: What's next? block at step 7 with /tr-refine, /tr-implement, /tr-backlog. Compliant. | resolved: 2026-04-12T13:48:41.195Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Generic agent terminology — no Claude/Cursor/GPT-specific language. Compliant. | resolved: 2026-04-12T13:48:40.915Z

- condition: check-if-affected: examples/ | note: Examples do not reference audit internals. Not affected. | resolved: 2026-04-12T13:48:40.608Z

- condition: check-if-affected: docs/ | note: Audit documented in docs/agents.md and docs/workflows.md. Declaration-only. | resolved: 2026-04-12T13:48:40.295Z

- condition: check-if-affected: skills/guide.md | note: /tr-audit already listed in guide.md. No new capability — no update needed. | resolved: 2026-04-12T13:48:39.974Z

- condition: check-if-affected: src/commands/update.ts | note: audit.md already in SKILL_FILES — no new skill file added. | resolved: 2026-04-12T13:48:39.665Z

- condition: check-if-affected: package.json | note: Prose-only impl — no TypeScript or new CLI commands. Not applicable. | resolved: 2026-04-12T13:48:39.382Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Skill-only (markdown prompt) — no TypeScript design decisions. Not applicable. | resolved: 2026-04-12T13:49:04.612Z
