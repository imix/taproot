# UseCase: Generate Project Overview

## Actor
Agentic developer / orchestrator or AI coding agent refreshing the project summary

## Preconditions
- `taproot/` directory exists with at least one intent document
- `taproot overview` is run (or `taproot update` is run, which includes it)

## Main Flow
1. Actor runs `taproot overview`
2. System walks the hierarchy and collects all intents, behaviours, and implementations
3. For each intent, system extracts: name, state, goal (first sentence)
4. For each behaviour, system extracts: name, state, actor
5. For each implementation, system extracts: name, state, commit count, test count
6. System writes `taproot/OVERVIEW.md` — a compact, structured markdown summary ordered by intent
7. System reports the output path

## Alternate Flows
- **No intents found**: system prints "No intents found — nothing to summarize" and does not write the file
- **Called by `taproot update`**: OVERVIEW.md is regenerated as part of the update cycle automatically

## Error Conditions
- **Malformed marker file**: missing section is skipped gracefully; document is included with partial data rather than omitted

## Postconditions
- `taproot/OVERVIEW.md` exists and reflects the current state of the hierarchy
- AI agents can read OVERVIEW.md at session start to orient themselves without reading every document

## Acceptance Criteria

**AC-1: Overview file is written**
- Given a taproot hierarchy with at least one intent
- When `taproot overview` is run
- Then `taproot/OVERVIEW.md` is created or overwritten with a structured summary of all intents, behaviours, and implementations

**AC-2: Empty hierarchy produces no file**
- Given a taproot directory with no intent documents
- When `taproot overview` is run
- Then the system prints "No intents found" and does not write OVERVIEW.md

**AC-3: Malformed document is included with partial data**
- Given a usecase.md or intent.md with a missing section
- When `taproot overview` is run
- Then the document is included in OVERVIEW.md with the available data; no error is thrown and no document is silently omitted

**AC-4: Overview reflects current state after update**
- Given a hierarchy that has changed since the last overview generation
- When `taproot update` is run (which includes overview generation)
- Then OVERVIEW.md reflects the current state of the hierarchy

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot overview](./cli-command/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19
