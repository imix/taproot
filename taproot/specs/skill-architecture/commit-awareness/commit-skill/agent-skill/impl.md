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
- `21625c35c523c1d372e398fc8081bf3c9c393535` — (auto-linked by taproot link-commits)
- `25697083369ac760fbfbe8747cd069c0af049920` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-1: one-condition-per-invocation; AC-2: conversational trigger; AC-4: declaration parent state check; AC-5: plain commit no gate; AC-7: mass commit [A]/[B]/[C]; requirement commit quality checks; declaration DoR without CLI

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — skill-only change; no CLI code, no I/O, no module boundaries affected | resolved: 2026-04-06T08:55:47.384Z

## DoD Resolutions
- condition: tests-passing | note: All 441 tests pass. New tests in test/unit/skills.test.ts cover AC-1 (one-at-a-time resolution), AC-2 (conversational trigger), AC-4 (declaration parent state), AC-5 (plain commit), AC-7 (mass commit A/B/C), requirement commit quality checks, and DoR resolution format. Updated test/unit/claude-md.test.ts covers the new /tr-commit CLAUDE.md trigger. | resolved: 2026-03-21T07:24:01.121Z
- condition: check-if-affected: package.json | note: not affected — no new dependencies; skill-only change | resolved: 2026-04-06T08:55:44.129Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: compliant — added a path format note only; no shell commands, no credentials, no new agent instructions that could escalate privileges | resolved: 2026-04-06T08:55:48.262Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — the ux-principles global truth already enforces abbreviated paths; no new settings.yaml condition needed | resolved: 2026-04-06T08:55:47.679Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — fix uses generic taproot terms throughout; no agent-specific language introduced in the skill | resolved: 2026-04-06T08:55:45.638Z

- condition: check-if-affected: examples/ | note: not affected — examples/ contains starter hierarchies; no example update warranted for path display fix | resolved: 2026-04-06T08:55:45.352Z

- condition: check-if-affected: docs/ | note: not affected — this fix corrects agent behaviour via the skill file; no CLI or user-facing docs need updating | resolved: 2026-04-06T08:55:45.080Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — abbreviated path convention is already documented in the ux-principles global truth | resolved: 2026-04-06T08:55:47.991Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No. The commit skill unifies existing commit procedure knowledge — it does not introduce a new cross-cutting constraint. The existing check-if-affected-by: skill-architecture/commit-awareness already covers commit procedure requirements for skills. | resolved: 2026-03-21T07:25:15.173Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — agent skill only. No CLI source code added. No architectural decisions in docs/architecture.md apply to markdown skill files. | resolved: 2026-03-21T07:25:09.795Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not affected — no pattern detection logic in commit skill; fix is in What's next display only | resolved: 2026-04-06T08:55:47.071Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: compliant — this impl IS the commit-awareness/commit-skill; fixing it to comply with ux-principles satisfies the commit-awareness spec | resolved: 2026-04-06T08:55:46.788Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — added 3 lines to step 7; skill remains within context-efficiency constraints; no on-demand loading changes needed | resolved: 2026-04-06T08:55:46.457Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not affected — no confirmation prompts changed; fix is additive to the What's next display section only | resolved: 2026-04-06T08:55:46.193Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — this fix directly enforces the contextual-next-steps convention: What's next paths now use abbreviated form per ux-principles. The skill already shows numbered options; fix adds path format guidance. | resolved: 2026-04-06T08:55:45.926Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md documents triggers and skill list; path display format is documented in ux-principles global truth, not guide.md | resolved: 2026-04-06T08:55:44.803Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts installs skill files; no enumeration logic changed | resolved: 2026-04-06T08:55:44.408Z

- condition: document-current | note: docs/ current — this is a skill-only fix (path format in What's next block); no CLI commands changed, no new features. No doc update needed. | resolved: 2026-04-06T08:55:43.861Z
- condition: gemini-adapter-addition | note: src/commands/init.ts updated to add gemini: 'Gemini CLI' label to AGENT_LABELS. This is a UI label for the interactive prompt only — no behavioral change to commit.md or the commit skill. Not applicable to this implementation. | resolved: 2026-03-21
- condition: gemini-skills-install | note: src/commands/init.ts updated to install skills when gemini adapter is selected (needsSkills now includes gemini). No behavioral change to commit skill. Not applicable to this implementation. | resolved: 2026-03-21
- condition: no-git-abort | note: src/commands/init.ts updated to abort with error if .git is absent. No behavioral change to commit skill. Not applicable to this implementation. | resolved: 2026-03-21
- condition: agent-support-tiers | note: src/commands/init.ts updated to add tier labels to interactive prompt and tier lines to install output. No behavioral change to commit skill. Not applicable to this implementation. | resolved: 2026-03-21

