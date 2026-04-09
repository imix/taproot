# Implementation: Discover and Decompose

## Behaviour
../usecase.md

## Design Decisions
- **Skill-file only — no TypeScript changes**: The Y/E/S/Q protocol is a conversational pattern enforced by the skill prompt. The LLM agent reads the skill file and follows the instructions; no CLI machinery is needed to enforce confirmation pauses.
- **discover.md is the primary target**: Explicitly called out in the usecase's Related section as "primary violating skill". Three write points are affected: intent.md (step 8e), usecase.md (step 10e), and impl.md (step 12f).
- **decompose.md secondary target**: Step 9 proposes multiple usecase.md files in sequence via `/taproot:behaviour` sub-skill invocations. A pause-before-delegate step is added so each proposed behaviour is confirmed before the sub-skill writes anything.
- **Auto-proceed added to both skills**: "just go" / "do all" / `--auto` opt-in is documented in the skill as an escape hatch; each remaining write still reports the path.
- **Session summary on Q/stop added to discover.md**: The usecase's AC-5 requires a written/skipped/remaining summary when the user quits. Discover's existing "Stopping early" clause is extended to include this.

## Source Files
- `skills/discover.md` — added Y/E/S/Q confirmation block before each of the three write points (intent, usecase, impl); extended stop/pause clause with session summary; added auto-proceed opt-in language
- `skills/decompose.md` — added confirmation pause before each approved behaviour is delegated to `/taproot:behaviour`

## Commits
<!-- taproot-managed -->
- `56a71b9a00c326aa9bf3da07c1f89d8536cb888a` — (auto-linked by taproot link-commits)
- `2423b20150dbe6b49a9ada2dc8d2dc35d02fd292` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/pause-and-confirm.test.ts` — verifies both skill files contain Y/E/S/Q menu pattern, auto-proceed language, and session summary language

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: This is a skill-file-only change (no new CLI commands, no API changes). The Y/E/S/Q protocol is documented within discover.md and decompose.md themselves. README.md and docs/ describe skill capabilities at a high level and do not need to document internal skill interaction patterns. | resolved: 2026-03-20T06:28:04.264Z
- condition: check-if-affected: skills/guide.md | note: guide.md references /tr-discover only as a brief skill description. The Y/E/S/Q pause-and-confirm protocol is an internal interaction pattern users encounter when running discover — it does not need to be mentioned in the onboarding guide. | resolved: 2026-03-20T06:28:06.672Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts regenerates agent adapters and skill files from source. This implementation changes skill file content (adding confirmation step language) but not skill file structure. update.ts logic is unaffected. | resolved: 2026-03-20T06:28:05.476Z

