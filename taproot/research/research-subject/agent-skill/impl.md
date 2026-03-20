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
- `e9f601c82d0147fd6620495dec9bb2e03f007170` — (auto-linked by taproot link-commits)
- `cbbf695679761a15bfd2162f34d1629fc8f5e0c5` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — covers all `SKILL_FILES` entries automatically: readable/non-empty, `# Skill:` heading, required sections present, Steps section has numbered list items

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: docs/agents.md and skills/guide.md updated with /tr-research entry; no other docs reference the full skill list | resolved: 2026-03-20T08:11:13.230Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — /tr-research is an existing documented skill; no new pattern revealed | resolved: 2026-03-20T16:07:23.049Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot.yaml? | note: no — research skill is self-contained; no new cross-cutting concern introduced | resolved: 2026-03-20T16:07:22.819Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: not applicable — skills/research.md is a markdown skill file; architecture-compliance constraints govern CLI source code, not skill markdown definitions | resolved: 2026-03-20T16:07:22.586Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: compliant — /tr-research includes a pattern check at step 0 via docs/patterns.md scan before routing; pattern-hints spec is satisfied | resolved: 2026-03-20T16:07:22.353Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Updated in context-engineering compliance pass. C-1: description trimmed to ~20 tokens (compliant). C-5: /compact signal added before What's next? in [S]ave path. C-2/C-3/C-4/C-6: compliant. | resolved: 2026-03-20T09:58:01.227Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — /tr-research writes at most one document (research/<slug>.md); pause-and-confirm applies to bulk-authoring skills that write multiple docs in sequence | resolved: 2026-03-20T08:11:14.155Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: applies and compliant — /tr-research step 8 [S] path presents a What's next? menu with /tr-behaviour and /tr-ineed options | resolved: 2026-03-20T08:11:13.925Z

- condition: check-if-affected: skills/guide.md | note: updated — added /tr-research row to the slash commands table | resolved: 2026-03-20T08:11:13.695Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts reads SKILL_FILES from init.ts dynamically; adding research.md to SKILL_FILES is sufficient | resolved: 2026-03-20T08:11:13.463Z
- condition: check-if-affected: src/commands/init.ts | note: init.ts changed (config path moved to .taproot/settings.yaml) — SKILL_FILES entry for research.md is unchanged; no impact on research skill installation | resolved: 2026-03-20T12:00:00.000Z
- condition: sweep-update | note: src/commands/init.ts updated to add 'sweep.md' to SKILL_FILES for /tr-sweep distribution; research.md SKILL_FILES entry unaffected | resolved: 2026-03-20T16:00:00.000Z

