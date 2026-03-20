# Behaviour: Hierarchy Sweep

## Actor
Developer — applying a uniform task across many hierarchy items without accumulating context drift. Also surfaced by `/tr-ineed` when the developer expresses a bulk-edit intent (e.g. "add X to all usecases").

## Preconditions
- A taproot hierarchy exists under `taproot/`
- The task can be evaluated independently per item (no cross-item context needed)

## Main Flow
1. Developer runs `/tr-sweep` and describes the task: what to apply and which items (e.g. "add a Notes section to all usecases")
2. Skill enumerates matching items and presents the list: `"Found 14 usecases"`
3. Skill confirms with the developer before proceeding: `"Apply '<task>' to each of these 14 items?"`
4. Skill writes `filelist.txt` (one path per line) and `prompt.txt` (the task description)
5. Skill calls `taproot apply filelist.txt prompt.txt`
6. `taproot apply` processes each file and prints a summary:
   ```
   Apply complete — 14 files processed
     ✓ modified:  8
     ○ skipped:   5
     ✗ errors:    1  taproot/foo/bar/usecase.md — <reason>
   ```

## Alternate Flows

### Developer cancels at confirmation
- **Trigger:** Developer says no at step 3
- **Steps:**
  1. Skill discards the filelist — no files are written, `taproot apply` is not called

### Surfaced by `/tr-ineed`
- Developer expresses a bulk-edit intent (e.g. "add X to all usecases")
- `/tr-ineed` interrupts: "That sounds like a hierarchy sweep. Want me to run `/tr-sweep`?"
- **[A] Yes** — runs the sweep
- **[B] No** — routes as a new requirement

## Postconditions
- The same task has been applied uniformly to every matching item
- Developer sees a summary of what changed

## Error Conditions
- **Task requires cross-item context** (e.g. "renumber all AC IDs globally"): skill warns "This task needs cross-item context — consider `/tr-review-all` instead." No filelist is written.
- **No matching items found**: `No <type> items found under <path>.`

## Flow
```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Skill as /tr-sweep
    participant CLI as taproot apply

    Dev->>Skill: /tr-sweep + task description
    Skill->>Dev: "Found 14 usecases — apply '<task>'?"
    alt confirmed
        Skill->>Skill: write filelist.txt + prompt.txt
        Skill->>CLI: taproot apply filelist.txt prompt.txt
        CLI-->>Dev: summary
    else cancelled
        Skill-->>Dev: aborted — no files written
    end
```

## Related
- `../../requirements-hierarchy/apply-task/usecase.md` — `taproot apply` executes the sweep; this skill generates the inputs
- `../route-requirement/usecase.md` — `/tr-ineed` surfaces sweep when it detects bulk-edit intent
- `../pause-and-confirm/usecase.md` — related pattern: multi-document operations with developer checkpoints

## Acceptance Criteria

**AC-1: Generates filelist and calls taproot apply**
- Given a hierarchy with 5 usecases and a developer-confirmed task
- When `/tr-sweep` runs
- Then `filelist.txt` and `prompt.txt` are written and `taproot apply` is called with them

**AC-2: Confirmation step prevents accidental execution**
- Given a developer who declines at the confirmation step
- When `/tr-sweep` presents the item list
- Then no files are written and `taproot apply` is not called

**AC-3: Surfaced by `/tr-ineed`**
- Given developer says "I want to add X to all usecases" via `/tr-ineed`
- When `/tr-ineed` processes the input
- Then it offers to invoke `/tr-sweep` before routing as a new requirement

## Implementations <!-- taproot-managed -->
- [Agent Skill — /tr-sweep](./agent-skill/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-20
- **Last reviewed:** 2026-03-20
