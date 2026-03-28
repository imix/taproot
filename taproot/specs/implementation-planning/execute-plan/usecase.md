# Behaviour: Execute Release Plan

## Actor
Developer — working through a previously built plan, delegating each item to the agent and confirming at each step boundary.

## Preconditions
- `taproot/plan.md` exists and contains at least one item with status `pending`

## Main Flow

### Orientation (no mode specified)

1. Developer invokes "execute plan" without specifying a mode.
2. Agent reads `taproot/plan.md` and counts pending items by type.
3. Agent presents the mode menu:
   ```
   Plan: N items pending (X hitl · Y afk)

   How would you like to proceed?
   [A] Step-by-step     — one item at a time, confirm each (default)
   [B] Batch            — confirm full list upfront, then run all
   [C] HITL only        — human-decision items only
   [D] AFK only         — autonomous items only
   [Q] Cancel
   ```
4. Developer selects a mode; agent continues with the corresponding flow below.

### Step-by-step mode (default)

1. Developer invokes "execute next item in plan" (or selects `[A]` from orientation).
2. Agent reads `taproot/plan.md` and identifies the first `pending` item.
3. Agent presents the item for confirmation:
   ```
   Next: [implement] taproot/<intent>/<behaviour>/ — <description>
   Skill: /tr-implement
   [A] Proceed  [S] Skip  [Q] Stop
   ```
4. Developer confirms with `[A]`.
5. Agent invokes the appropriate skill:
   - `spec` → `/tr-behaviour <path> "<description>"`
   - `implement` → `/tr-implement <path>`
   - `refine` → `/tr-refine <path>`
6. On skill completion, agent invokes `/tr-commit` to commit the output of the completed item. Once the commit succeeds, agent marks the item `done` in `taproot/plan.md`. If the commit fails or is aborted, the item is not marked `done` and the agent reports the blocker.
7. Agent reports. If the completed item was `hitl`:
   ```
   ✓ Done — <description>
   [+] Add follow-on to plan  [A] Continue to next  [D] Stop for now
   ```
   If the completed item was `afk`:
   ```
   ✓ Done — <description>
   M items remaining.
   [A] Continue to next  [D] Stop for now
   ```
8. If `[+]`: agent infers the logical follow-on (e.g. `spec hitl` done → offer `implement afk` for the same behaviour; `refine hitl` done → offer `implement afk`) and appends it to `taproot/plan.md` as a new `pending` item. Then present the updated item count and offer `[A] Continue · [D] Stop`.
9. If `[A]`: repeat from step 2 with the next pending item.
10. If `[D]` or no items remain: agent reports final status (see Postconditions).

### Batch mode

1. Developer invokes "execute all to next release" (or "execute all").
2. Agent reads `taproot/plan.md` and presents the full pending list:
   ```
   Executing N items:
    1. [spec]      <description>
    2. [implement] taproot/<intent>/<behaviour>/
   ...
   [A] Begin  [Q] Abort
   ```
3. Developer confirms.
4. Agent works through pending items sequentially — presenting each item before invoking its skill (same as step 3–6 of step-by-step mode).
5. After each `afk` item completes, agent marks it `done` and proceeds to the next without waiting. When a `hitl` item is reached, agent pauses and presents it for confirmation before invoking its skill — HITL items require human attention and may change what comes next.
6. When all items are done: *"Plan complete — all N items executed."*

## Alternate Flows

### Developer skips an item
- **Trigger:** Developer selects `[S]` at step 4.
- **Steps:**
  1. Agent marks the item `skipped` in `taproot/plan.md`.
  2. Agent moves to the next pending item and repeats from step 3.

### Item is blocked (skill cannot complete)
- **Trigger:** The invoked skill encounters an unresolvable error or the agent cannot proceed without developer input outside the normal flow.
- **Steps:**
  1. Agent marks the item `blocked` in `taproot/plan.md` with a one-line note.
  2. Agent reports: *"Item blocked: <reason>. Remaining items are unaffected."*
  3. In step-by-step mode: offer `[A] Continue to next · [D] Stop`.
  4. In batch mode: pause and wait for developer to resolve before continuing.

### Plan is empty or fully complete
- **Trigger:** `taproot/plan.md` exists but contains no `pending` items.
- **Steps:**
  1. Agent reports: *"Plan is complete — no pending items. Build a new plan with `/tr-plan build`."*
  2. No skills are invoked.

### Developer stops mid-batch
- **Trigger:** Developer types `done` or interrupts during batch execution.
- **Steps:**
  1. Agent finishes the current item if already in progress.
  2. Remaining items stay `pending` in `taproot/plan.md`.
  3. Agent reports: *"Stopped after N items — M items remaining."*

### HITL mode (hitl items only)
- **Trigger:** Developer invokes "hitl only", "run human items", selects `[C]` from orientation, or similar.
- **Steps:**
  1. Agent filters pending items to those labelled `hitl` only. `afk` items remain `pending` untouched.
  2. Agent presents the filtered list and proceeds with step-by-step or batch flow as requested.
  3. When filtered items are exhausted, agent reports: *"HITL pass complete — N items done. M afk items remain pending."*

### AFK mode (afk items only)
- **Trigger:** Developer invokes "afk only", "run autonomous", selects `[D]` from orientation, or similar.
- **Steps:**
  1. Agent filters pending items to those labelled `afk` only. `hitl` items remain `pending` untouched.
  2. Agent presents the filtered list and proceeds with batch flow (afk items require no human confirmation per-item).
  3. When filtered items are exhausted, agent reports: *"AFK pass complete — N items done. M hitl items remain pending."*

### Specify mode (spec + refine items only)
- **Trigger:** Developer invokes "bring all to specified", "run spec and refine only", or similar.
- **Steps:**
  1. Agent filters pending items to `spec` and `refine` types only. `implement` items are not presented and remain `pending`.
  2. Agent presents the filtered list and proceeds with step-by-step or batch flow as requested.
  3. When filtered items are exhausted, agent reports: *"Specify pass complete — N items done. M implement items remain pending."*

### Implement mode (implement items only)
- **Trigger:** Developer invokes "implement all specified items", "run implement only", or similar.
- **Steps:**
  1. Agent filters pending items to `implement` type only. `spec` and `refine` items are not presented and remain `pending`.
  2. Agent presents the filtered list and proceeds with step-by-step or batch flow as requested.
  3. When filtered items are exhausted, agent reports: *"Implement pass complete — N items done. M spec/refine items remain pending."*

### HITL item completed — follow-on offered
- **Trigger:** A `hitl` item completes successfully (step 6 of step-by-step mode, or during batch execution).
- **Steps:**
  1. Agent infers the logical follow-on item:
     - `spec hitl` done → `implement afk` for the same behaviour path
     - `refine hitl` done → `implement afk` for the same behaviour path
     - Other `hitl` items: agent proposes a follow-on if one is clearly implied; otherwise skips the offer.
  2. Agent offers: `[+] Add follow-on to plan` alongside the normal continue/stop options.
  3. If developer selects `[+]`: agent appends the follow-on as a new `pending afk` item to `taproot/plan.md` and confirms *"Added: [implement] afk <path>."*
  4. If developer declines or no follow-on is inferrable: continue normally.

## Postconditions
- Each executed item is marked `done` in `taproot/plan.md`.
- Skipped items are marked `skipped`; blocked items are marked `blocked` with a note.
- Each `done` item's output exists in the hierarchy (`usecase.md`, `impl.md`, or updated spec as appropriate).
- When all items are done: `taproot/plan.md` contains no `pending` items.
- After each completed `hitl` item, developer was offered the opportunity to append a follow-on item.

## Error Conditions
- **`taproot/plan.md` absent:** Agent reports *"No plan found — build one first with `/tr-plan build`."* No skills are invoked.
- **Item path invalid (behaviour deleted or moved):** Agent marks the item `stale` in `taproot/plan.md`, reports *"Item N is stale — path `<path>` not found."*, and offers `[S] Skip · [Q] Stop`.

## Flow

```mermaid
flowchart TD
    A[Developer: execute next / execute all] --> B{plan.md exists?}
    B -->|No| C[Report: no plan found]
    B -->|Yes| D{Any pending items?}
    D -->|No| E[Report: plan complete]
    D -->|Yes| F[Present next pending item]
    F --> G{Developer choice}
    G -->|A proceed| H[Invoke skill\ntr-behaviour / tr-implement / tr-refine]
    G -->|S skip| I[Mark skipped] --> K
    G -->|Q stop| J[Report stopped — M remaining]
    H --> L{Skill outcome}
    L -->|success| M[Mark done] --> K
    L -->|blocked| N[Mark blocked + note] --> O{Mode?}
    O -->|step-by-step| P[Offer continue / stop]
    O -->|batch| Q[Pause — wait for developer]
    K{More pending?} -->|Yes + batch mode| F
    K -->|Yes + step-by-step| R[Offer continue / stop]
    K -->|No| S[Report: plan complete]
```

## Related
- `../build-plan/usecase.md` — produces the `taproot/plan.md` file this behaviour consumes; must be run first
- `../extract-next-slice/usecase.md` — surfaces a single next item ad-hoc; execute-plan works through a pre-confirmed ordered list
- `../analyse-plan/usecase.md` — surfaces open questions and blockers in the plan before execution begins

## Acceptance Criteria

**AC-1: Next pending item presented before execution**
- Given `taproot/plan.md` contains at least one `pending` item
- When the developer invokes "execute next item"
- Then the agent presents the item type, description, and intended skill, and waits for confirmation before invoking it

**AC-2: Item marked done after skill completes**
- Given the developer confirms execution of a pending item
- When the invoked skill completes successfully
- Then the item is marked `done` in `taproot/plan.md`

**AC-3: Skip marks item and moves to next**
- Given the developer selects skip on a pending item
- When execution continues
- Then the item is marked `skipped` and the agent presents the next pending item

**AC-4: Batch mode executes all without per-item confirmation**
- Given the developer invokes "execute all" and confirms the full list
- When execution begins
- Then the agent works through all pending items sequentially without pausing for per-item confirmation

**AC-5: Blocked item pauses batch and reports**
- Given a skill cannot complete during batch execution
- When the blocker is detected
- Then the item is marked `blocked` with a note, execution pauses, and the developer is asked to resolve before continuing

**AC-6: No plan file exits with clear message**
- Given `taproot/plan.md` does not exist
- When the developer invokes execute-plan
- Then the agent reports no plan found and suggests `/tr-plan build`

**AC-7: All items done reports plan complete**
- Given all items in `taproot/plan.md` are `done`, `skipped`, or `blocked`
- When execute-plan runs
- Then the agent reports the plan is complete with no pending items

**AC-8: Specify mode processes only spec and refine items**
- Given `taproot/plan.md` contains a mix of `spec`, `refine`, and `implement` items
- When the developer invokes "bring all to specified"
- Then only `spec` and `refine` items are presented and executed; `implement` items remain `pending` and are reported as remaining at the end

**AC-9: Implement mode processes only implement items**
- Given `taproot/plan.md` contains a mix of `spec`, `refine`, and `implement` items
- When the developer invokes "implement all specified items"
- Then only `implement` items are presented and executed; `spec` and `refine` items remain `pending` and are reported as remaining at the end

**AC-10: HITL items pause in batch mode**
- Given `taproot/plan.md` contains at least one `hitl` item
- When batch execution reaches a `hitl` item
- Then the agent pauses, presents the item for confirmation, and waits before invoking its skill

**AC-12: Orientation shown when no mode specified**
- Given `taproot/plan.md` contains pending items
- When the developer invokes execute-plan without specifying a mode
- Then the agent presents a plan summary (pending count split by hitl/afk) and a mode menu before executing anything

**AC-20: Each completed item is committed before the next item starts**
- Given a plan item's skill completes successfully
- When execute-plan processes the completion
- Then `/tr-commit` is invoked and succeeds before the item is marked `done` and before the next pending item is presented

**AC-13: HITL mode processes only hitl-labelled items**
- Given `taproot/plan.md` contains a mix of `hitl` and `afk` items
- When the developer invokes HITL mode
- Then only `hitl` items are presented and executed; `afk` items remain `pending` and are reported as remaining at the end

**AC-14: AFK mode processes only afk-labelled items**
- Given `taproot/plan.md` contains a mix of `hitl` and `afk` items
- When the developer invokes AFK mode
- Then only `afk` items are presented and executed; `hitl` items remain `pending` and are reported as remaining at the end

**AC-11: Follow-on offered after HITL spec or refine completes**
- Given a `hitl` item of type `spec` or `refine` completes successfully
- When the agent reports completion
- Then the agent offers `[+] Add follow-on to plan` and if accepted, appends the corresponding `implement afk` item to `taproot/plan.md`

## Implementations <!-- taproot-managed -->
- [Agent Skill — plan-execute](./agent-skill/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-27
- **Last reviewed:** 2026-03-27

## Notes
- When invoked without a mode, the agent presents an orientation menu summarising the plan state and available modes. When a mode is specified explicitly (e.g. "implement all"), the orientation is skipped.
- Autonomous execution (agent works through all items without any human confirmation) is explicitly out of scope for this behaviour.
- The plan file format (how `done`/`skipped`/`blocked`/`pending` are encoded) is an implementation concern.
- In batch mode, the agent still presents each item before invoking its skill — the batch confirmation at the start grants permission to proceed through the list, but each item is still shown as it executes.
- Specify and implement modes are filters, not separate modes — they compose with step-by-step or batch. Filtered-out items stay `pending` (not `skipped`) so they can be processed in a subsequent pass with a different filter.
- A typical two-pass workflow: run HITL mode first to work through all human-decision items (spec, refine, design choices), then run AFK mode to execute all autonomous items without interruption.
- Specify and implement modes are type-based filters and remain available for teams that prefer to organise work by item type rather than execution mode.
