# Implementation: Agent Skill — suggest-commit-tag

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an addition to `skills/commit.md` (the `/tr-commit` skill) rather than a standalone skill — tag suggestion is a sub-step within the implementation commit flow, not an independently-invocable behaviour
- Tag suggestion is inserted after DoD resolution (step 4) and before staging (step 5) in the Implementation commit sub-flow — this is the natural moment when all impl.md matches are known and the commit message is being composed
- Multi-intent conflict detection: if staged files span two or more distinct intent paths, the agent cannot collapse to a single tag and offers split vs. proceed-together — matching AC-4
- Developer-supplied tags are detected by checking whether the message starts with a known prefix pattern (`taproot(`, `fix:`, `feat:`, `chore:`, etc.) — if so, the suggestion is skipped entirely per AC-3
- No TypeScript changes required — this is a pure skill instruction addition; the tag derivation logic is carried out by the agent at commit time

## Source Files
- `skills/commit.md` — added tag suggestion step (step 5) to Implementation commit sub-flow
- `taproot/agent/skills/commit.md` — sync copy of skills/commit.md

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/commit-tag-suggest.test.ts` — AC-1: single impl path → correct tag; AC-2: two impls same behaviour → collapsed tag; AC-3: developer-supplied tag preserved; AC-4: multi-intent → conflict reported; AC-5: plain commit → no tag

## Status
- **State:** complete
- **Created:** 2026-03-28
- **Last verified:** 2026-03-28

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — pure skill file change; no TypeScript source files, no new CLI commands, no database or external I/O; follows the existing skill architecture pattern | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md contains no NFR-N entries; the behaviour has no performance or reliability thresholds to implement | resolved: 2026-03-28

## DoD Resolutions
- condition: document-current | note: change adds a 'Suggest commit tag' step to skills/commit.md. Reviewed docs/cli.md (line 111: conventional tag format already documented), docs/workflows.md (commit flow not specifically documented in detail), README.md (no tr-commit mention). The new step is a UX improvement to /tr-commit — docs accurately reflect the skill at a high level; no doc update required as this is an internal skill step change, not a new CLI command or workflow | resolved: 2026-03-28T07:41:06.408Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: VERIFIED — skills/commit.md modified; new step instructs the agent to parse file paths (string operations only), present a suggestion, and wait for developer input. No shell command execution, no credentials, no tokens, no external calls. Follows least-privilege: agent only reads already-available impl.md paths and presents text to developer | resolved: 2026-03-28T08:03:31.190Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the tag derivation logic is specific to impl.md path conventions; not a general pattern applicable elsewhere | resolved: 2026-03-28T08:03:21.848Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — tag suggestion is scoped to the commit skill's implementation flow; it is not a rule that applies to every future implementation | resolved: 2026-03-28T08:03:15.056Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — pure skill file modification; no TypeScript source changes, no new external dependencies, no new database or API calls. Follows existing skill architecture pattern (agent instruction files) | resolved: 2026-03-28T08:03:04.874Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no new pattern was discovered or applied here; tag suggestion is specific to commit flow, not a reusable cross-cutting pattern | resolved: 2026-03-28T08:03:04.610Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: compliant — this implementation IS an extension of the commit skill itself; the new step runs before staging and committing, which satisfies C-1 (pre-commit context step present). C-2 and C-3 are inherited from the commit skill's existing sub-flow structure and are not changed | resolved: 2026-03-28T08:02:56.534Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — no new on-demand file loads added; the step uses already-known impl.md paths from earlier in the commit flow (the grep-rl match result). No heavy context loading introduced. The path parsing is a simple string operation on already-loaded data | resolved: 2026-03-28T08:02:48.381Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — the tag suggestion step presents a suggestion and waits for developer input before committing; this is already the pause-and-confirm pattern. No additional pause needed — the commit itself is the confirmation point | resolved: 2026-03-28T08:02:40.358Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this is a sub-step added to an existing skill (skills/commit.md), not a standalone skill. The parent /tr-commit skill already has a What's next block (step 7). No new top-level skill file was created | resolved: 2026-03-28T08:02:40.098Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: compliant — new step uses generic terms throughout: 'the developer', 'the agent', 'matched impl.md files'. No Claude-specific syntax (@{project-root}, CLAUDE.md, slash command names) used. Skill step describes agent-agnostic reasoning about file paths | resolved: 2026-03-28T07:41:26.148Z

- condition: check-if-affected: examples/ | note: not affected — examples/ contains starter templates unrelated to commit tag suggestion; no changes required | resolved: 2026-03-28T07:41:20.146Z

- condition: check-if-affected: docs/ | note: not affected — docs/ describes the conventional tag format in cli.md already; no new CLI commands or configuration options introduced; /tr-commit description unchanged at docs level | resolved: 2026-03-28T07:41:19.885Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md describes /tr-commit at a high level (line 69); the new tag suggestion step is an internal improvement; no guide update needed | resolved: 2026-03-28T07:41:13.274Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — no new skill files added that would need registering; skills/commit.md was already in SKILL_FILES; update.ts does not need changes | resolved: 2026-03-28T07:41:12.987Z

