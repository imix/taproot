# Implementation: Agent Skill — skills/commit.md + CLAUDE.md

## Behaviour
../usecase.md

## Design Decisions
- Implemented as a pure agent skill (skills/commit.md) — no CLI code needed. The skill is a markdown procedure file that agents read and execute.
- CLAUDE.md `## Before committing` section replaced with a single `/tr-commit` trigger. The detailed procedure now lives in the skill, not in CLAUDE.md, to avoid duplication and ensure both human-says-commit and agent-about-to-commit paths use the same spec.
- `commit.md` added to `SKILL_FILES` in `src/commands/init.ts` so it is installed by `taproot init` and copied by `taproot update`.
- Both `skills/` (package source) and `taproot/agent/skills/` (installed copy) maintained in sync per CLAUDE.md policy.
- Tests are content-proxy tests in `test/unit/skills.test.ts` — verify key phrases (one-at-a-time resolution, [A]/[B]/[C] mass commit, DoR resolution format, requirement commit quality checks) are present in the skill markdown.

## Source Files
- `skills/commit.md` — the callable `/tr-commit` skill: classification, sub-flows for all four commit types, DoD/DoR resolution loop, mass commit handling
- `taproot/agent/skills/commit.md` — installed copy (kept in sync with skills/commit.md)
- `src/commands/init.ts` — added `'commit.md'` to SKILL_FILES
- `CLAUDE.md` — replaced `## Before committing` manual scan with `/tr-commit` trigger

## Commits
- placeholder
- `ee187a3cd63ed2c5ff051f778def4f279a36d88c` — (auto-linked by taproot link-commits)
- `e66ab5498df954cc159d9aaee190fbb3451588bb` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-1: one-condition-per-invocation; AC-2: conversational trigger; AC-4: declaration parent state check; AC-5: plain commit no gate; AC-7: mass commit [A]/[B]/[C]; requirement commit quality checks; declaration DoR without CLI

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-27

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: agent skill only — no CLI source code added. No architectural decisions in docs/architecture.md apply to markdown skill files. Not applicable. | resolved: 2026-03-21

## DoD Resolutions
- condition: tests-passing | note: All 441 tests pass. New tests in test/unit/skills.test.ts cover AC-1 (one-at-a-time resolution), AC-2 (conversational trigger), AC-4 (declaration parent state), AC-5 (plain commit), AC-7 (mass commit A/B/C), requirement commit quality checks, and DoR resolution format. Updated test/unit/claude-md.test.ts covers the new /tr-commit CLAUDE.md trigger. | resolved: 2026-03-21T07:24:01.121Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No. The commit skill is a specific procedural execution skill — not a configuration pattern. The commit-awareness check-if-affected-by pattern already exists and governs what skills must know about commits. | resolved: 2026-03-21T07:25:19.220Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No. The commit skill unifies existing commit procedure knowledge — it does not introduce a new cross-cutting constraint. The existing check-if-affected-by: skill-architecture/commit-awareness already covers commit procedure requirements for skills. | resolved: 2026-03-21T07:25:15.173Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — agent skill only. No CLI source code added. No architectural decisions in docs/architecture.md apply to markdown skill files. | resolved: 2026-03-21T07:25:09.795Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. commit.md is a procedural execution skill — it does not receive natural language requirement descriptions and does not route to docs/patterns.md. Pattern-hints applies to ineed, behaviour, implement, and refine. | resolved: 2026-03-21T07:25:05.075Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: This IS the commit-awareness implementation — it is the callable skill that satisfies all three constraints. C-1: step 4 reads settings.yaml and runs the appropriate gate proactively before staging. C-2: all four commit classifications are surfaced with their respective gates. C-3: implementation commit sub-flow explicitly stages impl.md alongside source files with a real diff (produced by taproot dod --resolve). Compliant. | resolved: 2026-03-21T07:24:59.070Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Compliant. C-1: description is one sentence, under 50 tokens. C-2: no external docs embedded — specs referenced by path, read on demand. C-3: no CLAUDE.md duplication — CLAUDE.md now has a single trigger line. C-4: settings.yaml read in step 4 only when needed. C-5: skill has no /compact signal — it is a short procedural skill. C-6: no What's next? needed (execution skill). All compliant. | resolved: 2026-03-21T07:24:52.811Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Compliant. The conversational trigger (alternate flow) explicitly pauses and asks for confirmation before staging: 'Should I stage these and proceed?' The mass commit flow also pauses with [A]/[B]/[C] choice. No destructive action (git commit) proceeds without user confirmation when triggered conversationally. | resolved: 2026-03-21T07:24:46.672Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable — commit.md is a procedural execution skill, not a content-creation skill. It does not produce primary output requiring a What's next? block. The skill terminates after the commit completes. | resolved: 2026-03-21T07:24:40.850Z

- condition: check-if-affected: skills/guide.md | note: Added /tr-commit to the Slash Commands table in skills/guide.md and taproot/agent/skills/guide.md. | resolved: 2026-03-21T07:24:35.599Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts copies files listed in SKILL_FILES. commit.md was added to SKILL_FILES in init.ts — update.ts will pick it up automatically. No changes to update.ts needed. | resolved: 2026-03-21T07:24:13.054Z

- condition: document-current | note: No new CLI commands added. The skill is installed via taproot init/update (commit.md added to SKILL_FILES). docs/agents.md lists skills — skills/guide.md covers the user-facing listing. No README or docs/ changes needed for a new skill file. | resolved: 2026-03-21T07:24:07.469Z
- condition: gemini-adapter-addition | note: src/commands/init.ts updated to add gemini: 'Gemini CLI' label to AGENT_LABELS. This is a UI label for the interactive prompt only — no behavioral change to commit.md or the commit skill. Not applicable to this implementation. | resolved: 2026-03-21
- condition: gemini-skills-install | note: src/commands/init.ts updated to install skills when gemini adapter is selected (needsSkills now includes gemini). No behavioral change to commit skill. Not applicable to this implementation. | resolved: 2026-03-21
- condition: no-git-abort | note: src/commands/init.ts updated to abort with error if .git is absent. No behavioral change to commit skill. Not applicable to this implementation. | resolved: 2026-03-21
- condition: agent-support-tiers | note: src/commands/init.ts updated to add tier labels to interactive prompt and tier lines to install output. No behavioral change to commit skill. Not applicable to this implementation. | resolved: 2026-03-21

