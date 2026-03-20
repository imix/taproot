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
- `skills/ineed.md` — C-1 description trim; C-4 defer OVERVIEW read to step 2; C-5 add /compact signal
- `skills/grill-me.md` — C-1 description trim; C-4 defer spec read to step 2; C-5 add /compact signal
- `skills/research.md` — C-1 description trim; C-5 add /compact signal
- `skills/trace.md` — C-5 add /compact signal
- `skills/discover.md` — C-5 add /compact signal
- `skills/decompose.md` — C-5 add /compact signal
- `skills/intent.md` — C-5 add /compact signal
- `skills/implement.md` — C-5 add /compact signal
- `skills/behaviour.md` — C-5 add /compact signal
- `skills/promote.md` — C-5 add /compact signal
- `skills/guide.md` — C-5 add /compact signal
- `skills/refine.md` — C-5 add /compact signal
- `skills/analyse-change.md` — C-5 add /compact signal
- `skills/review.md` — C-5 add /compact signal
- `skills/review-all.md` — C-5 add /compact signal
- `skills/plan.md` — C-5 add /compact signal

## Commits
- placeholder

## Tests
- None — this behaviour is enforced via agent reasoning at DoD time (C-1 through C-6 are agent-verifiable conditions, not executable assertions). Acceptance criteria are verified manually at DoD.

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: No new CLI commands, skills, or configuration options added. Changes are internal to skill step content (description trims, step reordering, /compact signal additions). README.md and docs/ remain accurate. | resolved: 2026-03-20T09:51:26.112Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: Updated in pattern-hints implementation pass. All 16 skills had pattern check steps added (ineed, behaviour, implement, refine directly; others indirectly via the same impl pass). Compliant with pattern-hints spec: interruptive step 0/1a, [A]/[B] choice, docs/patterns.md read on demand. | resolved: 2026-03-20T10:33:33.804Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: This impl.md is not a skill file — context-engineering constraints (C-1 through C-6) govern skills/*.md files only. C-1/C-2/C-3/C-4/C-5/C-6 are all not applicable to an implementation record. The skill files modified by this implementation have been evaluated and corrected against all six constraints. | resolved: 2026-03-20T09:51:56.094Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. pause-and-confirm governs skills that write documents during a user-facing interactive workflow. This is a developer/agent implementation session modifying skill source files — not a user-facing skill output. The files written are the implementation deliverables, not documents produced for a user during a skill session. | resolved: 2026-03-20T09:51:46.413Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Compliant. ineed.md was the only skill file missing a What's next? block — one was added in this implementation (step 8 output). All other modified skills already had What's next? blocks. This implementation brings all 16 affected skills into C-6 compliance. | resolved: 2026-03-20T09:51:45.153Z

- condition: check-if-affected: skills/guide.md | note: Updated in this implementation — C-5 /compact signal added to guide.md step 4. The skills table descriptions are independently authored and remain accurate; no further changes needed. | resolved: 2026-03-20T09:51:34.828Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. update.ts copies skill files by name from skills/ to .taproot/skills/. No change to file names, structure, or copy logic is required — skill files were updated in place. | resolved: 2026-03-20T09:51:33.576Z

