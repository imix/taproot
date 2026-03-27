# Implementation Patterns

## Batch Skill Progress Persistence

Skills that process items in steps or batches (e.g. `discover-truths`, `sweep`) **must** write their progress to a status file so sessions survive context compression.

**File path:** `.taproot/sessions/<skill-slug>-status.md`

**Rules:**
- Write after each confirmed item — not just at phase boundaries
- On startup: check for an existing status file and offer to resume or restart
- On clean completion: delete the status file
- On next run after an interrupted session: overwrite the existing status file
- Format: a checklist of items with `[x]` / `[ ]` markers, a phase/cursor indicator, and a Notes section for session context

**No shared pointer file.** The status file name is self-documenting. An agent resuming after compression scans `.taproot/sessions/` to find where it was. A separate `working-on.md` is not needed and would conflict under parallel execution.

**Reference implementation:** `taproot/plan.md` (used by `plan-execute`) — already survives compression by design. Per-skill status files follow the same pattern at a smaller scope.

**Note on parallel execution:** This pattern assumes single-agent execution. When parallel agent execution is supported, locking and status file ownership will need to be revisited.

**Applies to:** any skill that iterates over a list of items where each item requires agent action or developer confirmation and the list may be too long to complete in a single context window.
