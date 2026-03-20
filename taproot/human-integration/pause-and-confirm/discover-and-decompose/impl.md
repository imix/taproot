# Implementation: Discover and Decompose

## Behaviour
../usecase.md

## Design Decisions
- **Skill-file only — no TypeScript changes**: The Y/E/S/Q protocol is a conversational pattern enforced by the skill prompt. The LLM agent reads the skill file and follows the instructions; no CLI machinery is needed to enforce confirmation pauses.
- **discover.md is the primary target**: Explicitly called out in the usecase's Related section as "primary violating skill". Three write points are affected: intent.md (step 5e), usecase.md (step 7e), and impl.md (step 9f).
- **decompose.md secondary target**: Step 9 proposes multiple usecase.md files in sequence via `/taproot:behaviour` sub-skill invocations. A pause-before-delegate step is added so each proposed behaviour is confirmed before the sub-skill writes anything.
- **Auto-proceed added to both skills**: "just go" / "do all" / `--auto` opt-in is documented in the skill as an escape hatch; each remaining write still reports the path.
- **Session summary on Q/stop added to discover.md**: The usecase's AC-5 requires a written/skipped/remaining summary when the user quits. Discover's existing "Stopping early" clause is extended to include this.

## Source Files
- `skills/discover.md` — added Y/E/S/Q confirmation block before each of the three write points (intent, usecase, impl); extended stop/pause clause with session summary; added auto-proceed opt-in language
- `skills/decompose.md` — added confirmation pause before each approved behaviour is delegated to `/taproot:behaviour`

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/pause-and-confirm.test.ts` — verifies both skill files contain Y/E/S/Q menu pattern, auto-proceed language, and session summary language

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
