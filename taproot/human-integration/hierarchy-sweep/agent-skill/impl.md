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
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — skill is a pure markdown file with no source code; no I/O, no state; the architecture constraints (stateless, actionable errors, command boundaries) govern CLI commands, not skill markdown; not applicable | resolved: 2026-03-20T15:45:00.000Z
