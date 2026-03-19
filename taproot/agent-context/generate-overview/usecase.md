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

## Status
- **State:** active
- **Created:** 2026-03-19
