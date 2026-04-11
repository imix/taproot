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
   [1] Step-by-step     — one item at a time, confirm each (default)
   [2] Batch            — confirm full list upfront, then run all
   [3] HITL only        — human-decision items only
   [4] AFK only         — autonomous items only
   [C] Cancel
   ```
4. Developer selects a mode; agent continues with the corresponding flow below.

### Step-by-step mode (default)

1. Developer invokes "execute next item in plan" (or selects `[A]` from orientation).
2. Agent reads `taproot/plan.md` and identifies the first `pending` item.
3. Before presenting, if the item references a path with an existing `usecase.md`, read its `# Behaviour: <title>` heading. Then present the item:
   ```
   Next: [implement] taproot/<intent>/<behaviour>/
         "Validate Input Parameters" — <goal>
   Skill: /tr-implement
   [R] Review spec  [A] Proceed  [L] Later  [X] Drop  [C] Cancel
   ```
   Where `"<Behaviour Title>"` is read from the referenced `usecase.md`'s heading (omitted if no spec exists yet — `spec` type items); `<goal>` is the plan item's inline description if present, otherwise a one-sentence summary of what the behaviour achieves derived from the spec's Actor and main outcome.
4. Developer confirms with `[A]`.
5. Agent invokes the appropriate skill:
   - `spec` → `/tr-behaviour <path> "<description>"`
   - `implement` → `/tr-implement <path>`
   - `refine` → `/tr-refine <path>`
6. On skill completion, agent invokes `/tr-commit` to commit the output of the completed item. Once the commit succeeds, agent marks the item `done` in `taproot/plan.md`. If the commit fails or is aborted, the item is not marked `done` and the agent reports the blocker.
7. Agent reports completion. If the completed item was type `spec` or `refine`, and no `implement` item for the same path already exists in `taproot/plan.md`:
   ```
   ✓ Done — <description>
   [+] Add follow-on to plan  [A] Continue to next  [D] Done for now
   ```
   Otherwise:
   ```
   ✓ Done — <description>
   M items remaining.
   [A] Continue to next  [D] Done for now
   ```
8. If `[+]`: agent appends an `implement afk` item for the same behaviour path to `taproot/plan.md` as a new `pending` item and confirms *"Added: [implement] afk <path>."* Then presents the updated item count and offers `[A] Continue · [D] Done`.
9. If `[A]`: repeat from step 2 with the next pending item.
10. If `[D]` or no items remain: agent reports final status (see Postconditions).

### Batch mode

1. Developer invokes "execute all to next release" (or "execute all").
2. Agent reads `taproot/plan.md` and presents the full pending list. For each item with an existing `usecase.md`, read its `# Behaviour: <title>` heading and append it inline:
   ```
   Executing N items:
    1. [spec]      <description>
    2. [implement] taproot/<intent>/<behaviour>/ — "Validate Input Parameters"
    3. [refine]    taproot/<intent>/<behaviour>/usecase.md — "Execute Release Plan"
   ...
   [A] Begin  [C] Cancel
   ```
3. Developer confirms.
4. Agent works through pending items sequentially — presenting each item before invoking its skill (same as step 3–6 of step-by-step mode, including reading the behaviour title from each item's `usecase.md`).
5. After each `afk` item completes, agent marks it `done` and proceeds to the next without waiting. When a `hitl` item is reached, agent pauses and presents it with `[R] Review spec [A] Proceed [L] Later [X] Drop [C] Cancel` before invoking its skill — HITL items require human attention and may change what comes next.
6. When all items are done: *"Plan complete — all N items executed."*

## Alternate Flows

### Developer defers an item
- **Trigger:** Developer selects `[L]` at the item prompt.
- **Steps:**
  1. Agent marks the item `deferred` in `taproot/plan.md`.
  2. Agent moves to the next pending item and repeats from step 3.
  3. Deferred items are carried forward into future plans — they represent "do later, not now."

### Developer drops an item
- **Trigger:** Developer selects `[X]` at the item prompt.
- **Steps:**
  1. Agent marks the item `dropped` in `taproot/plan.md`.
  2. Agent moves to the next pending item and repeats from step 3.
  3. Dropped items are intentionally excluded — they will not reappear unless manually re-added.

### Developer reviews item before deciding
- **Trigger:** Developer selects `[R]` at the item confirmation prompt (step 3 of step-by-step mode, or at any HITL pause in batch mode).
- **Steps:**
  1. Agent invokes `/tr-browse <path>` for the item's behaviour path and lets it run to full completion — including any sub-actions the developer selects within browse (e.g. `/tr-audit`, navigating further sections). The plan-execute prompt is not re-presented until browse has fully exited.
  2. Once browse has fully exited, agent re-presents the same item prompt unchanged:
     ```
     Next: [implement] taproot/<intent>/<behaviour>/
           "<Behaviour Title>" — <goal>
     Skill: /tr-implement
     [R] Review spec  [A] Proceed  [L] Later  [X] Drop  [C] Cancel
     ```
  3. Developer may review again or choose `[A]`, `[L]`, `[X]`, or `[C]`.

### Item is blocked (skill cannot complete)
- **Trigger:** The invoked skill encounters an unresolvable error or the agent cannot proceed without developer input outside the normal flow.
- **Steps:**
  1. Agent marks the item `blocked` in `taproot/plan.md` with a one-line note.
  2. Agent reports: *"Item blocked: <reason>. Remaining items are unaffected."*
  3. In step-by-step mode: offer `[A] Continue to next · [D] Done for now`.
  4. In batch mode: pause and wait for developer to resolve before continuing.

### Plan is empty or fully complete
- **Trigger:** `taproot/plan.md` exists but contains no `pending` items.
- **Steps:**
  1. Agent reports: *"Plan is complete — no pending items. Build a new plan with `/tr-plan`."*
  2. No skills are invoked.

### Developer stops mid-batch
- **Trigger:** Developer types `done` or interrupts during batch execution.
- **Steps:**
  1. Agent finishes the current item if already in progress.
  2. Remaining items stay `pending` in `taproot/plan.md`.
  3. Agent reports: *"Stopped after N items — M items remaining."*

### HITL mode (hitl items only)
- **Trigger:** Developer invokes "hitl only", "run human items", selects `[3]` from orientation, or similar.
- **Steps:**
  1. Agent filters pending items to those labelled `hitl` only. `afk` items remain `pending` untouched.
  2. Agent presents the filtered list and proceeds with step-by-step flow (HITL items require human decisions during execution — batch is not offered).
  3. When filtered items are exhausted, agent reports: *"HITL pass complete — N items done. M afk items remain pending."*

### AFK mode (afk items only)
- **Trigger:** Developer invokes "afk only", "run autonomous", selects `[4]` from orientation, or similar.
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

### spec or refine item completed — follow-on offered
- **Trigger:** An item of type `spec` or `refine` completes successfully, and no `implement` item for the same path already exists in `taproot/plan.md`.
- **Steps:**
  1. Agent offers `[+] Add follow-on to plan` alongside the normal continue/stop options.
  2. If developer selects `[+]`: agent appends an `implement afk` item for the same behaviour path to `taproot/plan.md` as a new `pending` item and confirms *"Added: [implement] afk <path>."*
  3. If developer declines: continue normally.

## Postconditions
- Each executed item is marked `done` in `taproot/plan.md`.
- Deferred items are marked `deferred` (do later); dropped items are marked `dropped` (intentionally excluded); blocked items are marked `blocked` with a note.
- Each `done` item's output exists in the hierarchy (`usecase.md`, `impl.md`, or updated spec as appropriate).
- When all items are done: `taproot/plan.md` contains no `pending` items.
- After each completed `spec` or `refine` item where no matching `implement` item already exists in `taproot/plan.md`, developer was offered the opportunity to append a follow-on `implement afk` item.
- No item is marked `done` without a successful `/tr-commit` — the commit gate is mandatory, not optional.

## Error Conditions
- **`taproot/plan.md` absent:** Agent reports *"No plan found — build one first with `/tr-plan`."* No skills are invoked.
- **Item path invalid (behaviour deleted or moved):** Agent marks the item `stale` in `taproot/plan.md`, reports *"Item N is stale — path `<path>` not found."*, and offers `[L] Later · [X] Drop · [C] Cancel`.
- **Commit gate omitted — item stays in-progress:** If `/tr-commit` is not invoked after a skill completes, or if the commit fails or is aborted, the item must not be marked `done`. The agent must not present the next pending item until the commit succeeds. If the commit cannot be completed, the item is treated as `blocked` (not `done`).

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
    G -->|L later| I[Mark deferred] --> K
    G -->|X drop| I2[Mark dropped] --> K
    G -->|R review| T[Invoke /tr-browse path] --> F
    G -->|C cancel| J[Report stopped — M remaining]
    H --> L{Skill outcome}
    L -->|success| M1[Invoke /tr-commit]
    M1 -->|succeeds| M[Mark done] --> K
    M1 -->|fails/aborted| N[Mark blocked + note] --> O{Mode?}
    L -->|blocked| N
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

**AC-3: Defer marks item and moves to next**
- Given the developer selects defer on a pending item
- When execution continues
- Then the item is marked `deferred` and the agent presents the next pending item

**AC-24: Drop marks item and moves to next**
- Given the developer selects drop on a pending item
- When execution continues
- Then the item is marked `dropped` and the agent presents the next pending item

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
- Then the agent reports no plan found and suggests `/tr-plan`

**AC-7: All items done reports plan complete**
- Given all items in `taproot/plan.md` are `done`, `deferred`, `dropped`, or `blocked`
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

**AC-11: Follow-on offered after spec or refine item completes**
- Given an item of type `spec` or `refine` completes successfully
- And no `implement` item for the same path already exists in `taproot/plan.md`
- When the agent reports completion
- Then the agent offers `[+] Add follow-on to plan` and if accepted, appends an `implement afk` item for the same path to `taproot/plan.md`

**AC-22: Review option available at HITL item prompt**
- Given a pending plan item is presented for confirmation
- When the developer selects `[R]`
- Then the agent invokes `/tr-browse` for the item's path, lets it run to full completion including any sub-actions the developer takes within browse, and only then re-presents the same item prompt with all options intact

**AC-23: Browse sub-actions execute fully before plan-execute resumes**
- Given the developer selected `[R]` and is inside browse
- When the developer selects a browse exit action (e.g. `[C] /tr-audit`)
- Then that action runs to completion before plan-execute re-presents the HITL prompt — browse exit options are not swallowed

**AC-21: Item prompt includes behaviour title and goal**
- Given a pending plan item references a path with an existing `usecase.md`
- When the agent presents the item for confirmation
- Then the prompt includes the behaviour title from `# Behaviour: <title>` and a one-line goal (plan item's inline description if present, otherwise a one-sentence summary derived from the spec's Actor and main outcome)

## Implementations <!-- taproot-managed -->
- [Agent Skill — plan-execute](./agent-skill/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-27
- **Last reviewed:** 2026-03-30
- **Refined:** 2026-03-30 — enriched item display: behaviour title + one-line goal in Next: prompt (AC-21)
- **Refined:** 2026-03-30 — added [R] Review spec option to HITL pause menu; invokes /tr-browse and returns to same prompt (AC-22)
- **Refined:** 2026-03-30 — clarified [R] browse runs to full completion before plan-execute resumes; browse sub-actions (e.g. /tr-audit) must not be swallowed (AC-23)
- **Refined:** 2026-04-02 — HITL mode always step-by-step (batch meaningless for human-decision items); AFK mode always batch (no per-item prompt for autonomous items)
- **Refined:** 2026-04-03 — replaced ambiguous `skipped` status with `deferred` (do later) and `dropped` (intentionally excluded); [L] Later and [X] Drop replace [S] Skip; letter assignments aligned with UX principles truth
- **Refined:** 2026-04-11 — follow-on offer extended from hitl-only to all spec/refine completions; added guard: offer only if no implement item for the same path already exists in taproot/plan.md (AC-11)

## Notes
- When invoked without a mode, the agent presents an orientation menu summarising the plan state and available modes. When a mode is specified explicitly (e.g. "implement all"), the orientation is skipped.
- Autonomous execution (agent works through all items without any human confirmation) is explicitly out of scope for this behaviour.
- The plan file format (how `done`/`deferred`/`dropped`/`blocked`/`pending` are encoded) is an implementation concern.
- In batch mode, the agent still presents each item before invoking its skill — the batch confirmation at the start grants permission to proceed through the list, but each item is still shown as it executes.
- Specify and implement modes are filters, not separate modes — they compose with step-by-step or batch. Filtered-out items stay `pending` (not `deferred`) so they can be processed in a subsequent pass with a different filter.
- A typical two-pass workflow: run HITL mode first to work through all human-decision items (spec, refine, design choices), then run AFK mode to execute all autonomous items without interruption.
- Specify and implement modes are type-based filters and remain available for teams that prefer to organise work by item type rather than execution mode.
