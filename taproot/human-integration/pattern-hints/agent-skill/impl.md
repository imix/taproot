# Implementation: Agent Skill Pattern Check

## Behaviour
../usecase.md

## Design Decisions
- Pattern check is inserted as a new **step 0** in skills where the need is expressed at invocation (ineed, refine). In behaviour and implement it fires at the first step that receives the user's description.
- Signal phrases from the spec are embedded directly in the step text so the agent knows exactly what to match against — no ambiguity about what constitutes a "match".
- The interruption presents the pattern name, a one-line description, and [A]/[B] choice. It does not dump the full `docs/patterns.md` content into context — it names the pattern and the agent reads the relevant section on demand if the user chooses [A].
- All four skills (ineed, behaviour, implement, refine) updated. Other skills (tr-plan, tr-decompose, etc.) are less likely to receive raw requirement expressions and are left for future passes when their source implementations are touched.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) updated in sync per CLAUDE.md policy.

## Source Files
- `skills/ineed.md` — step 0 added: scan docs/patterns.md before classifying requirement
- `skills/behaviour.md` — step 1a added: scan for pattern match on the behaviour description
- `skills/implement.md` — step 4 updated: check for pattern match before presenting implementation plan
- `skills/refine.md` — step 0 added: scan for pattern match on the change being described

## Commits
- placeholder

## Tests
- None — agent-verifiable at DoD via ACs. Pattern matching is semantic reasoning, not an executable assertion.

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
