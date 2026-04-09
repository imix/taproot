# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure skill-file implementation — no TypeScript/CLI changes. The behaviour is entirely agent-driven: the agent follows the skill instructions.
- `browse.md` added to `SKILL_FILES` in `src/commands/init.ts` so it is installed by `taproot init` and refreshed by `taproot update`.
- Discussion context shown at a single anchor per browse session (not repeated per section) — reduces noise while still surfacing the rationale at the most relevant point.
- Long-section pagination threshold of ~20 lines is a guideline in the skill notes rather than a hard rule — gives the agent judgment to handle edge cases (e.g. 22 very short lines vs 15 very long lines).
- `[S] Skip to children` included from the start (per refined spec, AC-1) — lets the developer jump straight to the children list when they've already read the spec.
- Taproot-managed section warning (`## Commits`, `## DoD Resolutions`) prevents accidental corruption of machine-managed sections without blocking the developer if they knowingly want to edit.
- Both `skills/` (package source) and `taproot/agent/skills/` (installed copy) updated per CLAUDE.md sync policy.

## Source Files
- `skills/browse.md` — new skill file implementing all 8 ACs; seven steps covering path resolution, discussion.md detection, section presentation, [C]/[M]/[S] interaction, pagination, children listing, and What's next? block
- `taproot/agent/skills/browse.md` — synced from skills/
- `src/commands/init.ts` — added `'browse.md'` to `SKILL_FILES`
- `skills/guide.md` — added `/tr-browse` to the slash commands reference table
- `taproot/agent/skills/guide.md` — synced from skills/

## Commits
<!-- taproot-managed -->
- `9e44e0bfd79172467fa0d1c949cd07e2c7c14ba8` — (auto-linked by taproot link-commits)
- `712bff6273a37badaf369cca4f2a6b1bd4a99c55` — (auto-linked by taproot link-commits)
- `379557502909be7b8cee6f7f09c3a2d433b1ea09` — (auto-linked by taproot link-commits)
- `503cb47a0165fe387fbbf68190b768ed6f20c7c8` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-1: [C]/[M]/[S] options present; AC-3: children listing and leaf message; AC-4/AC-7: discussion.md anchors; AC-5: path error messages; AC-8: change-of-mind handling

## Status
- **State:** complete
- **Created:** 2026-03-25
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance governs TypeScript CLI source code; this implementation modifies only skill files and SKILL_FILES array | resolved: 2026-03-25T13:05:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR entries in usecase.md; browse has no performance targets | resolved: 2026-03-25T13:05:00.000Z

## DoD Resolutions
- condition: document-current | note: skills/guide.md updated with /tr-browse entry. README.md and docs/ document CLI commands, not individual skill steps — no further changes required. | resolved: 2026-03-25T13:06:42.283Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — skills/browse.md and skills/guide.md additions contain only documentation text and interactive prompts; no shell commands, no credentials, no executable instructions beyond 'read this file and display sections'. | resolved: 2026-03-25T13:06:46.034Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the [C]/[M]/[S] interaction pattern is specific to the browse skill; it is not a cross-cutting architectural pattern for other skills or implementations. | resolved: 2026-03-25T13:06:45.646Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — browse is a standalone reading skill; it does not introduce a pattern that every implementation must satisfy. | resolved: 2026-03-25T13:06:45.389Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance governs TypeScript CLI source code; this implementation modifies only skill files and the SKILL_FILES array constant. | resolved: 2026-03-25T13:06:45.144Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints governs skills that receive natural language need descriptions; browse receives a file path, not a user-expressed requirement. | resolved: 2026-03-25T13:06:44.886Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — browse.md does not include any git commit steps; [M] edits save to file but do not stage or commit. No commit-awareness constraints apply. | resolved: 2026-03-25T13:06:44.638Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — browse.md reads only the target document and optionally its discussion.md (two files maximum); no background docs loaded; no unnecessary context accumulation. Session hygiene note present. | resolved: 2026-03-25T13:06:44.364Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — pause-and-confirm governs skills that write multiple documents in sequence; browse writes at most one document (via [M] edits) and does not bulk-author. | resolved: 2026-03-25T13:06:44.102Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: APPLIED — browse.md step 7 added with What's next? block offering [A] /tr-browse child, [B] /tr-implement, [C] /tr-audit; compact hint included. | resolved: 2026-03-25T13:06:43.833Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — browse.md uses agent-agnostic language throughout: 'the agent', 'the developer', 'the skill'; no Claude-specific syntax or references. | resolved: 2026-03-25T13:06:43.575Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — browse is a reading/editing skill; starter examples demonstrate hierarchy structure, not skill usage patterns. | resolved: 2026-03-25T13:06:43.317Z

- condition: check-if-affected: docs/ | note: NOT APPLICABLE — docs/ covers CLI commands and configuration; /tr-browse is a slash command documented in skills/guide.md, not a CLI binary command. No docs/ changes required. | resolved: 2026-03-25T13:06:43.059Z

- condition: check-if-affected: skills/guide.md | note: APPLIED — added /tr-browse row to the slash commands table in skills/guide.md and synced to taproot/agent/skills/guide.md. | resolved: 2026-03-25T13:06:42.797Z

- condition: check-if-affected: src/commands/update.ts | note: NOT APPLICABLE — taproot update regenerates skills from SKILL_FILES; browse.md is now in SKILL_FILES so it will be installed/refreshed automatically. No change to update.ts logic needed. | resolved: 2026-03-25T13:06:42.537Z

