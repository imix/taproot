# Implementation: Agent Skill — /tr-research

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill rather than a CLI command — research requires interactive tool use (web search, file reading) and dialogue; no automated pipeline can conduct domain-aware expert grilling
- `research.md` skill file name maps to `/tr-research` command via `taproot update` adapter generation — consistent with all other skill implementations
- Skill steps mirror the usecase exactly: local scan → prior research check → multi-query web search → preliminary synthesis → expert check (delegates to `/tr-grill-me`) → final summary → save/feed/quit
- Multi-query web search (4+ targeted queries per topic) rather than a single literal search — produces richer, more specific findings
- Slug confirmation before writing: skill proposes `research/<slug>.md` and waits for developer approval — prevents silent filename collisions and gives the developer control over the canonical reference name
- `[Q] Discard` option at the output step — developer may find the research unhelpful or discover they researched the wrong topic; skill must provide a clean exit
- Graceful degradation documented explicitly: local-only, web-only, expert-only, and all-unavailable paths all have defined behaviour

## Source Files
- `skills/research.md` — canonical skill definition (package source)
- `.taproot/skills/research.md` — installed copy (managed by `taproot update`)
- `src/commands/init.ts` — added `'research.md'` to `SKILL_FILES`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — covers all `SKILL_FILES` entries automatically: readable/non-empty, `# Skill:` heading, required sections present, Steps section has numbered list items

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
