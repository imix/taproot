# Implementation: Agent Skill — /tr-sweep

## Behaviour
../usecase.md

## Design Decisions
- Skill processes each file in-session directly — no subprocess, no temp files (filelist.txt/prompt.txt removed). The agent reads and edits each file itself, which avoids the headless permission problem that blocked `taproot apply`.
- Developer confirmation (Y/N) is a hard gate before any files are processed — satisfies AC-2
- Cross-item context detection at step 1 prevents misuse (e.g. "renumber AC IDs globally" needs review-all, not sweep)
- `[x] <path>` progress line emitted after each file completes — satisfies AC-4; developer sees live progress rather than a batch summary at the end
- For codebase-exploration tasks, the slug (second-to-last path segment) is the key for finding related artefacts (test files, source files). Agent derives slug per-file rather than requiring a pre-built map.
- Scope defaults to `taproot/`; type filter is inferred from natural language or asked if ambiguous
- `sweep.md` in `SKILL_FILES` in `src/commands/init.ts` so `taproot init --with-skills` and `taproot update` distribute it

## Source Files
- `skills/sweep.md` — the skill definition installed to agent skill directories

## Commits
- (run `taproot link-commits` to populate)
- `289b48b5cfd2db12c28e00294acae59d8f5c7737` — (auto-linked by taproot link-commits)
- `9231e6513cbfc8cd4c61839dbaab9cde9c73b4f8` — (auto-linked by taproot link-commits)
- `ee1cccba468bfef1086afb56cd47d5fe721cefcc` — (auto-linked by taproot link-commits)
- `4d115a13084f77a46ef22e1bec3ef1b7c5db3840` — (auto-linked by taproot link-commits)
- `5759ada7eb364678c368f716041cc835812f21f8` — (auto-linked by taproot link-commits)
- `5d513054bd0f6f365b001f74b07bb48282550759` — (auto-linked by taproot link-commits)
- `dd8d7c70bf7f6e0490cdcdd68e94300c316a32b0` — (auto-linked by taproot link-commits)
- `d5888d5b8cfe8d0539cbfde67573a9ab3cfcc991` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — AC-1: [x] progress marking present; AC-2: Y/N confirmation gate and cancellation; AC-4: [x] line includes taproot path; cross-item context warning redirects to /tr-audit-all

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-04-09
- **Note:** AC-specific tests added to test/unit/skills.test.ts (AC-1, AC-2, AC-4)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — skill is a pure markdown file with no source code; no I/O, no state; the architecture constraints (stateless, actionable errors, command boundaries) govern CLI commands, not skill markdown; not applicable | resolved: 2026-03-20T15:45:00.000Z

## DoD Resolutions
- condition: document-current | note: added /tr-sweep to docs/agents.md skills table; added /tr-sweep to skills/guide.md command reference table | resolved: 2026-03-20T15:56:49.737Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Compliant — sweep.md has no shell commands, no credentials, no tokens; writes only to .taproot/sessions/sweep-status.md via agent action. | resolved: 2026-03-27T20:48:50.867Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — status file persistence is captured by the batch-skill-progress global truth; no new settings.yaml entry needed. | resolved: 2026-03-27T20:48:50.605Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — sweep.md contains no git commit steps; it edits hierarchy files in-session only. | resolved: 2026-03-27T20:48:50.343Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Compliant — skills/sweep.md uses no agent-specific syntax; 'the developer', 'the agent' throughout; no Claude/Cursor-specific references. | resolved: 2026-03-27T20:48:50.088Z

- condition: check-if-affected: examples/ | note: Not affected — example starters do not reference /tr-sweep or demonstrate its session state. | resolved: 2026-03-27T20:48:49.825Z

- condition: check-if-affected: docs/ | note: Not affected — sweep's docs/workflows.md entry already covers the skill; status file is an internal implementation detail not requiring doc updates. | resolved: 2026-03-27T20:48:49.560Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — in-session per-file iteration is the natural agent approach; not a reusable pattern worth documenting | resolved: 2026-03-20T17:26:38.670Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — in-session per-file processing is specific to sweep; no new architectural constraint | resolved: 2026-03-20T17:26:38.439Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — skills/sweep.md is a markdown skill file; architecture-compliance governs CLI source code | resolved: 2026-03-20T17:26:38.211Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — /tr-sweep receives a task and executes it; no user-expressed need routing or pattern matching | resolved: 2026-03-20T17:26:37.978Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — C-1: description ~25 tokens; C-2: no embedded docs; C-3: no cross-skill repetition; C-4: enumeration at step 2 only when needed; C-5: /compact signal at step 5/6 boundary; C-6: What's next? block present | resolved: 2026-03-20T17:26:37.744Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — /tr-sweep performs one Y/N confirmation at step 3 before iterating; not a multi-document authoring skill | resolved: 2026-03-20T17:26:37.496Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with What's next? block at step 6 with [A] /tr-sweep again and [B] /tr-status | resolved: 2026-03-20T17:26:37.259Z

- condition: check-if-affected: skills/guide.md | note: not affected — /tr-sweep already listed in skills/guide.md; description change is internal to sweep.md | resolved: 2026-03-20T17:26:37.023Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — sweep.md already in SKILL_FILES; update.ts copies files by name, no change needed | resolved: 2026-03-20T17:26:36.788Z

- condition: document-current | note: sweep.md already documented in docs/agents.md and skills/guide.md; description updated from 'calls taproot apply' to 'processes files in-session' — no new CLI commands or config options introduced | resolved: 2026-03-20T17:26:36.554Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — in-session per-file iteration is the natural agent approach; no new pattern needed | resolved: 2026-03-20T15:58:01.063Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — /tr-sweep is a user-facing skill, not an architectural constraint | resolved: 2026-03-20T15:58:00.833Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: evaluated all 6 constraints: C-1 description ~25 tokens (compliant); C-2 no embedded reference docs (compliant); C-3 no cross-skill repetition (compliant); C-4 no bulk file pre-loads — enumeration happens at step 2 when needed (compliant); C-5 /compact signal added before What's next? block at step 5/6 boundary (compliant); C-6 What's next? block present at end of step 6 (compliant) | resolved: 2026-03-20T15:57:51.607Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — architecture-compliance governs CLI command source code; skills/sweep.md is a markdown skill file with no source code | resolved: 2026-03-20T15:57:12.994Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that receive a user-expressed need and route it; /tr-sweep receives a task description and executes it directly | resolved: 2026-03-20T15:57:12.760Z
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to bulk multi-document authoring skills; /tr-sweep performs one confirmation at step 3, then iterates autonomously | resolved: 2026-03-20T15:57:12.530Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with a What's next? block at step 6 with two lettered options | resolved: 2026-03-20T15:57:12.298Z
- condition: check-if-affected: skills/guide.md | note: already listed — /tr-sweep present in skills/guide.md command reference table; description update only, no new entry needed | resolved: 2026-03-20T15:56:50.206Z
- condition: check-if-affected: src/commands/update.ts | note: not affected — sweep.md already in SKILL_FILES; no change needed | resolved: 2026-03-20T15:56:49.969Z
