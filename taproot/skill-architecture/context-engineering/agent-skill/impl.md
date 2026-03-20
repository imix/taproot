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
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
