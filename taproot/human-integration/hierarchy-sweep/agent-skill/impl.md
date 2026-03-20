# Implementation: Agent Skill — /tr-sweep

## Behaviour
../usecase.md

## Design Decisions
- Skill writes `filelist.txt` and `prompt.txt` to project root, then calls `taproot apply` — the CLI handles per-file agent invocations; the skill only orchestrates filtering and confirmation
- Developer confirmation (Y/N) is a hard gate before any files are written — satisfies AC-2
- Cross-item context detection at step 1 prevents misuse (e.g. "renumber AC IDs globally" needs review-all, not sweep)
- Prompt written to `prompt.txt` is self-contained: instructs the agent to read the file first, then apply the task — the agent receives only the file path via `$TAPROOT_APPLY_FILE`, no conversation context
- Scope defaults to `taproot/`; type filter is inferred from natural language or asked if ambiguous
- `sweep.md` added to `SKILL_FILES` in `src/commands/init.ts` so `taproot init --with-skills` and `taproot update` distribute it

## Source Files
- `skills/sweep.md` — the skill definition installed to agent skill directories

## Commits
- (run `taproot link-commits` to populate)

## Tests
- Skill content satisfies AC-1 (step 4+5: writes filelist.txt + prompt.txt, calls taproot apply)
- Skill content satisfies AC-2 (step 3: confirmation gate, stops if developer says no)
- AC-3 is specified in the ineed skill, not implemented here

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — skill is a pure markdown file with no source code; no I/O, no state; the architecture constraints (stateless, actionable errors, command boundaries) govern CLI commands, not skill markdown; not applicable | resolved: 2026-03-20T15:45:00.000Z

## DoD Resolutions
- condition: document-current | note: added /tr-sweep to docs/agents.md skills table; added /tr-sweep to skills/guide.md command reference table | resolved: 2026-03-20T15:56:49.737Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the enumerate+confirm+delegate pattern is specific to the sweep workflow; the underlying mechanism (taproot apply) is already documented in docs/cli.md; no new docs/patterns.md entry needed | resolved: 2026-03-20T15:58:01.063Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot.yaml? | note: no — /tr-sweep is a user-facing skill, not an architectural constraint; the confirmation-before-bulk-edit pattern is covered by human-integration/pause-and-confirm which is already in .taproot.yaml | resolved: 2026-03-20T15:58:00.833Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: evaluated all 6 constraints: C-1 description ~25 tokens (compliant); C-2 no embedded reference docs (compliant); C-3 no cross-skill repetition (compliant); C-4 no bulk file pre-loads — enumeration happens at step 2 when needed (compliant); C-5 /compact signal added before What's next? block at step 5/6 boundary (compliant); C-6 What's next? block present at end of step 6 (compliant) | resolved: 2026-03-20T15:57:51.607Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: not applicable — architecture-compliance governs CLI command source code (stateless functions, I/O at boundaries, etc.); skills/sweep.md is a markdown skill file with no source code; architectural constraints do not apply to markdown skill definitions | resolved: 2026-03-20T15:57:12.994Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that receive a user-expressed need and route it (e.g. /tr-ineed, /tr-behaviour); /tr-sweep receives a task description and executes it directly; no pattern matching or routing logic needed | resolved: 2026-03-20T15:57:12.760Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to bulk multi-document authoring skills (discover, decompose) that create multiple hierarchy files; /tr-sweep performs one confirmation at step 3 before calling taproot apply, which is a single CLI invocation, not per-document authoring; the pattern is satisfied at the sweep level by the Y/N gate | resolved: 2026-03-20T15:57:12.530Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — skill ends with a What's next? block at step 6 with two lettered options: [A] /tr-sweep again and [B] /tr-status; leaf skill (produces filelist.txt, prompt.txt, and taproot apply summary directly) | resolved: 2026-03-20T15:57:12.298Z

- condition: check-if-affected: skills/guide.md | note: affected and updated — added /tr-sweep to the Slash Commands table in skills/guide.md | resolved: 2026-03-20T15:56:50.206Z

- condition: check-if-affected: src/commands/update.ts | note: affected and updated — added sweep.md to SKILL_FILES in src/commands/init.ts (shared by update.ts via import); taproot update will now distribute sweep.md to agent skill directories | resolved: 2026-03-20T15:56:49.969Z

