# Implementation: Agent Skill Compliance Pass

## Behaviour
../usecase.md

## Design Decisions
- No CLI code is written — all constraints govern skill file *content*. The implementation is the corrected skill files themselves.
- C-5 `/compact` signal is placed immediately before the `## What's next?` block in each long skill. Wording is standardised: `> 💡 If this session is getting long, consider running \`/compact\` or starting a fresh context before the next task.`
- C-1 trimming moves detail from `## Description` into the `## Steps` section (which is already the canonical home for step detail). No information is lost.
- C-4 fixes in `ineed.md` and `grill-me.md` defer the OVERVIEW.md read to the step that first *uses* the hierarchy information, not step 1. The load still happens — just one step later.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) are updated in sync per CLAUDE.md policy.

## Source Files
- (none — this implementation is a one-time compliance sweep enforced via DoD check at each skill's own implementation commit, not through permanent file ownership; individual skill files are owned by their respective impl.md records)

## Commits
- placeholder
- `0cfe26d7c7b5c1f65a26a9084a4b7c912c46f7b2` — (auto-linked by taproot link-commits)
- `644e0ec95f4cf48b0abf01cad46cf464a2bfff92` — (auto-linked by taproot link-commits)

## Tests
- None — this behaviour is enforced via agent reasoning at DoD time (C-1 through C-6 are agent-verifiable conditions, not executable assertions). Acceptance criteria are verified manually at DoD.

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: No new CLI commands, skills, or configuration options added. Changes are internal to skill step content (description trims, step reordering, /compact signal additions). README.md and docs/ remain accurate. | resolved: 2026-03-20T09:51:26.112Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — context-engineering is already enforced via check-if-affected-by in .taproot.yaml; the enforcement pattern is already documented in docs/patterns.md | resolved: 2026-03-20T16:08:33.145Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot.yaml? | note: this story IS the cross-cutting concern mechanism (check-if-affected-by: skill-architecture/context-engineering is already in .taproot.yaml); no additional entries needed | resolved: 2026-03-20T16:08:32.910Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: not applicable — this impl modifies skill files (skills/*.md), not CLI source code; architecture-compliance constraints govern CLI command implementations | resolved: 2026-03-20T16:08:32.674Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Updated in pattern-hints implementation pass. All 16 skills had pattern check steps added (ineed, behaviour, implement, refine directly; others indirectly via the same impl pass). Compliant with pattern-hints spec: interruptive step 0/1a, [A]/[B] choice, docs/patterns.md read on demand. | resolved: 2026-03-20T10:33:33.804Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: This impl.md is not a skill file — context-engineering constraints (C-1 through C-6) govern skills/*.md files only. C-1/C-2/C-3/C-4/C-5/C-6 are all not applicable to an implementation record. The skill files modified by this implementation have been evaluated and corrected against all six constraints. | resolved: 2026-03-20T09:51:56.094Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. pause-and-confirm governs skills that write documents during a user-facing interactive workflow. This is a developer/agent implementation session modifying skill source files — not a user-facing skill output. The files written are the implementation deliverables, not documents produced for a user during a skill session. | resolved: 2026-03-20T09:51:46.413Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. ineed.md was the only skill file missing a What's next? block — one was added in this implementation (step 8 output). All other modified skills already had What's next? blocks. This implementation brings all 16 affected skills into C-6 compliance. | resolved: 2026-03-20T09:51:45.153Z

- condition: check-if-affected: skills/guide.md | note: Updated in this implementation — C-5 /compact signal added to guide.md step 4. The skills table descriptions are independently authored and remain accurate; no further changes needed. | resolved: 2026-03-20T09:51:34.828Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. update.ts copies skill files by name from skills/ to .taproot/skills/. No change to file names, structure, or copy logic is required — skill files were updated in place. | resolved: 2026-03-20T09:51:33.576Z
- condition: sweep-update | note: skills/guide.md updated to add /tr-sweep to the Slash Commands table; this is a content addition, not a context-engineering compliance issue | resolved: 2026-03-20T16:00:00.000Z
- condition: commit-awareness-update | note: skills/implement.md updated as part of skill-architecture/commit-awareness implementation — pre-commit context steps added to steps 6 and 9; context-engineering compliance unaffected (C-1 description unchanged, C-5 /compact signal unchanged, C-6 What's next block unchanged) | resolved: 2026-03-20T20:00:00.000Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — this impl.md is an implementation record, not a skill file; commit-awareness constraints govern skills/*.md files that contain git commit steps; this implementation modified skill content files (skills/*.md) as its deliverable, not as an implementation artifact | resolved: 2026-03-20T20:00:00.000Z
- condition: discover-update | note: skills/discover.md updated as part of project-discovery/discover-existing-project extension — requirements artifact detection added (Phase 0.5), conflict resolution flow added, requirements-only mode added; context-engineering compliance re-evaluated: C-1 description trimmed to ~30 tokens (compliant), C-5 /compact signal unchanged, C-6 What's next? unchanged | resolved: 2026-03-20T20:00:00.000Z

