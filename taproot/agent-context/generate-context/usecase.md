# UseCase: Generate Agent Context File

## Actor
CI pipeline or agentic developer generating a machine-optimised context snapshot

## Preconditions
- `taproot/` directory exists with at least one intent document

## Main Flow
1. Actor runs `taproot coverage --format context`
2. System computes a full coverage report (intents, behaviours, implementations, counts)
3. System generates `taproot/CONTEXT.md` with:
   - Summary counts (intents, behaviours, implementations, complete, tested)
   - Hierarchy tree view (intent → behaviour → impl with states)
   - Needs-attention section: in-progress impls, unimplemented behaviours, impls missing tests
   - Quick reference for common CLI commands
4. System writes the file and reports the output path

## Alternate Flows
- **On merge pipeline**: CONTEXT.md is regenerated after `taproot link-commits` so it includes the latest commit linkages
- **Scoped path**: `--path` option generates context for a subtree only

## Error Conditions
- **No intents**: generates a minimal context file noting the hierarchy is empty

## Postconditions
- `taproot/CONTEXT.md` exists with a dated snapshot of the hierarchy state
- AI agents reading CONTEXT.md get the full picture — what's done, what's in progress, and what needs attention — without traversing individual documents

## Status
- **State:** active
- **Created:** 2026-03-19
