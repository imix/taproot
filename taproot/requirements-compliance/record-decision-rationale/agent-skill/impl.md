# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure skill-file implementation — no TypeScript/CLI changes. The behaviour is entirely agent-driven: the agent follows the skill instructions.
- Step 5b inserted in `implement.md` between step 5a (update usecase.md Implementations section) and step 6 (declaration commit), so `discussion.md` is staged with `impl.md` in the same commit.
- Step 9b inserted in `behaviour.md` after step 9 (write usecase.md) as an explicit optional — not step 9a to avoid renumbering the existing 9b (which doesn't exist, but to leave room).
- Template documented inline in the skill (four sections: Pivotal Questions, Alternatives Considered, Decision, Open Questions) — no separate template file needed; agents read the skill and reproduce it.
- "When to skip" guidance explicitly documented in `implement.md` to address AC-3 — a skill that always writes the file would produce low-quality noise for trivial commits.
- Both `skills/` (package source) and `.taproot/skills/` (installed copy) updated per CLAUDE.md sync policy.

## Source Files
- `skills/implement.md` — added step 5b: write `discussion.md` with four-section template and skip guidance; updated step 6 header to mention `discussion.md`
- `skills/behaviour.md` — added step 9b: optional `discussion.md` for substantive spec-authoring sessions
- `.taproot/skills/implement.md` — synced from skills/
- `.taproot/skills/behaviour.md` — synced from skills/

## Commits
<!-- taproot-managed -->

## Tests
- `test/unit/skills.test.ts` — AC-1: implement.md contains discussion.md step before declaration commit, covers all four sections, stages with impl.md; AC-2: behaviour.md has optional discussion.md step referencing the same template; AC-3: trivial session skip guidance documented

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — skill file authoring; architecture-compliance governs CLI source code, not skill files | resolved: 2026-03-25T12:10:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no performance-sensitive code paths; skill file edit only | resolved: 2026-03-25T12:10:00.000Z

## Status
- **State:** complete
- **Created:** 2026-03-25

## DoD Resolutions
- condition: document-current | note: docs/ and README.md do not document agent skill steps — they document CLI commands and configuration. discussion.md is an agent-driven artefact described in skills/implement.md and skills/behaviour.md, which are the correct home for this content. No docs/ or README.md change required. | resolved: 2026-03-25T12:11:25.381Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — skills/implement.md and skills/behaviour.md additions contain only documentation text and a markdown template; no shell commands, no credentials, no executable instructions beyond 'write this file' | resolved: 2026-03-25T12:12:48.378Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — discussion.md is an agent-written file instructed via skill steps; it is not a DoD/DoR settings.yaml pattern. docs/patterns.md documents check-if-affected-by and document-current patterns for settings.yaml configuration, not document templates. | resolved: 2026-03-25T12:12:47.111Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — discussion.md generation is enforced via the skill steps themselves, not via a DoD condition. The optional hook enforcement (verify-discussion-coverage) is a separate specced behaviour. | resolved: 2026-03-25T12:12:37.568Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: NOT APPLICABLE — architecture-compliance applies to TypeScript CLI implementations; this implementation modifies only skill files | resolved: 2026-03-25T12:12:36.262Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints governs skills that process user-expressed needs; the modifications are to implementation/authoring steps, not need-routing steps | resolved: 2026-03-25T12:12:34.947Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: COMPLIANT — implement.md step 6 (declaration commit) updated to mention discussion.md staging; the commit-awareness constraints for declaration and implementation commit steps remain intact and unchanged | resolved: 2026-03-25T12:12:26.031Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — implement.md step 5b uses inline template (necessary action content, not background docs); behaviour.md step 9b references 'same four-section template as tr-implement' rather than duplicating it (no C-3 violation); no new file reads added (C-4 satisfied); session hygiene signal unchanged (C-5 still present at step 13) | resolved: 2026-03-25T12:12:24.714Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — pause-and-confirm governs bulk-authoring skills writing multiple documents; this adds a single optional step to implement.md and behaviour.md | resolved: 2026-03-25T12:12:23.418Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — contextual-next-steps governs the What's next? block at the end of a skill; no changes were made to the terminal output steps of implement.md or behaviour.md | resolved: 2026-03-25T12:12:13.286Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: APPLIED — skill additions use agent-agnostic language throughout: 'the agent', 'the skill', no Claude-specific references; template uses generic markdown; compliant | resolved: 2026-03-25T12:12:12.049Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — starter examples demonstrate hierarchy structure (intents, behaviours, impls); discussion.md is an agent-written session artefact, not a structural element to include in starters | resolved: 2026-03-25T12:12:10.759Z

- condition: check-if-affected: docs/ | note: NOT APPLICABLE — docs/ covers CLI commands, configuration, and architecture; discussion.md is skill-driven behaviour documented in the skill files themselves | resolved: 2026-03-25T12:11:36.851Z

- condition: check-if-affected: skills/guide.md | note: NOT APPLICABLE — guide.md documents CLI commands and slash commands; discussion.md is an agent-written artefact instructed via skill steps, not a user-invocable command | resolved: 2026-03-25T12:11:35.585Z

- condition: check-if-affected: src/commands/update.ts | note: NOT APPLICABLE — taproot update refreshes skills and adapters; discussion.md files are hierarchy artefacts managed by agents, not refreshed by the update command | resolved: 2026-03-25T12:11:34.289Z

