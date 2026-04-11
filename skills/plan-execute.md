# Skill: plan-execute

## Description

Execute items from `taproot/plan.md` one at a time (step-by-step) or in sequence (batch), with optional filters to process only `spec`+`refine` items (specify mode) or only `implement` items (implement mode).

## Inputs

- `mode` (optional): `step-by-step` (default), `batch`, `specify`, or `implement` — inferred from developer's natural language request if not explicit

## Steps

1. **Check for plan.** If `taproot/plan.md` does not exist, report:
   > *"No plan found — build one first with `/tr-plan`."*
   Stop — no skills invoked.

2. **Read `taproot/plan.md`.** Collect all items and their current status.

3. **Check autonomous mode.** If autonomous mode is active (`TAPROOT_AUTONOMOUS=1`, `--autonomous`, or `autonomous: true` in settings): automatically apply the **afk** filter — process only `afk`-labelled items. Skip the mode menu (step 3a) and proceed directly to step 4 with afk filter active. HITL items are left `pending` untouched.

   **Detect mode** from the developer's request (interactive mode only):
   - *"execute next item"* / *"execute plan"* / *"run next"* → **step-by-step** (default)
   - *"execute all"* / *"run all"* / *"batch"* → **batch**
   - *"hitl only"* / *"run human items"* / *"interactive only"* → **hitl** (filter: `hitl` items only; always step-by-step)
   - *"afk only"* / *"run autonomous"* / *"implement automatically"* → **afk** (filter: `afk` items only; always batch — no per-item prompt)
   - *"bring all to specified"* / *"run spec and refine only"* / *"specify mode"* → **specify** (filter: `spec` + `refine` types only)
   - *"implement all specified"* / *"implement all"* / *"run implement only"* → **implement** (filter: `implement` type only)
   - No mode specified (bare `/tr-plan-execute` or ambiguous): → **show orientation** (step 3a)

   **3a. Orientation** (only when no mode is specified): count pending items by execution mode and present the mode menu:
   ```
   Plan: N items pending (X hitl · Y afk)

   How would you like to proceed?
   [1] Step-by-step     — one item at a time, confirm each (default)
   [2] Batch            — confirm list, then run all (pauses on hitl items)
   [3] HITL only        — human-decision items, one at a time
   [4] AFK only         — autonomous items, run all without pausing
   [C] Cancel
   ```
   Wait for developer response, then continue with the chosen mode.

4. **Filter pending items** based on mode:
   - *step-by-step / batch*: all `pending` items
   - *hitl*: `pending` items labelled `hitl`; `afk` items remain `pending` untouched
   - *afk*: `pending` items labelled `afk`; `hitl` items remain `pending` untouched
   - *specify*: `pending` items where type is `[spec]` or `[refine]`; `[implement]` items remain `pending` untouched
   - *implement*: `pending` items where type is `[implement]`; `[spec]` and `[refine]` items remain `pending` untouched

5. **Check for pending items.** If the filtered list is empty (no pending items matching the filter):
   - If the overall plan has no `pending` items at all: report *"Plan is complete — no pending items. Build a new plan with `/tr-plan`."*
   - If items exist but none match the filter: report *"No [hitl | afk | spec/refine | implement] items pending."*
   Stop — no skills invoked.

6. **In batch mode**, present the full filtered list first and wait for confirmation. For each item with a path to an existing `usecase.md`, read its `# Behaviour: <title>` heading and append it inline:
   ```
   Executing N items:
    1. [spec]      "description"
    2. [implement] <intent>/<behaviour>/ — "Validate Input Parameters"
    3. [refine]    <intent>/<behaviour>/usecase — "Execute Release Plan"
   ...
   [A] Begin  [C] Cancel
   ```
   If `[C]`: stop — no changes made.

7. **For each pending item** (in plan order, respecting the filter):

   **Path handling:** plan.md stores abbreviated paths (hierarchy root and `.md` stripped). Always display the abbreviated form. Before invoking a skill or CLI command, expand to the full path: prepend the hierarchy root (`taproot/` or configured root) and restore `.md` for file references.

   **a. Present the item** (always — even in batch mode, each item is shown before its skill runs). If the item references a path with an existing `usecase.md`, read its `# Behaviour: <title>` heading first:
   ```
   Next: [implement] <intent>/<behaviour>/
         "Validate Input Parameters" — <goal>
   Skill: /tr-implement
   [R] Review spec  [A] Proceed  [L] Later  [X] Drop  [C] Cancel
   ```
   Where `"<Behaviour Title>"` comes from the `# Behaviour:` heading of the referenced `usecase.md` (omitted for `[spec]` items with no existing spec); `<goal>` is the plan item's inline description if present, otherwise a one-sentence summary derived from the spec's Actor and main outcome.

   **b. Determine execution style for this item:**
   - **Step-by-step mode** or **HITL-only mode**: always wait for developer response.
   - **Batch mode**: wait only if the item is labelled `hitl`; skip to c for `afk` items.
   - **AFK-only mode**: always skip to c (no per-item prompt — the upfront confirmation in step 6 grants permission).

   **When waiting for developer response**, present:
   - `[R]`:
     - **If the item has an existing path** (a `usecase.md` is present): invoke `/tr-browse <path>` and let browse run to full completion — including any sub-actions the developer selects within browse (e.g. `/tr-audit`, navigating sections). Do not re-present the plan-execute prompt until the developer has finished all browse activity and browse itself has exited.
     - **If the item has no spec yet** (`[spec]` type with no existing path): show available design context inline — the item description, which skill will handle it, and any relevant hierarchy context (parent intent goal, sibling behaviours). Do not invoke `/tr-browse`.
     - **In both cases**: re-present the same item prompt unchanged with all options — `[R] Review  [A] Proceed  [L] Later  [X] Drop  [C] Cancel`. `[R]` must always reappear so the developer can continue reviewing before committing to proceed.
   - `[A]` or affirmative: proceed to c
   - `[L]`: mark item `deferred` in `taproot/plan.md` (do later — carried forward to future plans); move to next item
   - `[X]`: mark item `dropped` in `taproot/plan.md` (intentionally excluded — won't reappear); move to next item
   - `[C]`: stop — remaining items stay `pending`

   **c. Invoke the skill** based on item type:
   - `[spec]` → `/tr-behaviour <path> "<description>"`
   - `[implement]` → `/tr-implement <path>`
   - `[refine]` → `/tr-refine <path>`

   **d. Mandatory commit gate**: immediately after skill completion, invoke `/tr-commit`. This step is **not optional** — do not mark the item `done` until `/tr-commit` succeeds. Do not present the next item until the commit is complete.
   - If `/tr-commit` succeeds: mark the item `done` in `taproot/plan.md`.
   - If `/tr-commit` fails or is aborted: treat as blocked (step e). The item stays `in-progress` — not `done`, not `pending`.

   **e. On skill failure / unresolvable blocker**: mark the item `blocked` with a one-line note in `taproot/plan.md`. Report:
   > *"Item blocked: <reason>. Remaining items are unaffected."*
   - *Step-by-step*: offer `[A] Continue to next · [C] Cancel`
   - *Batch*: pause and wait for developer to resolve before continuing

   **f. After each completed item**, apply the same execution-style logic as step b:
   - **Step-by-step** or **HITL-only**, or **batch mode with a `hitl` item**: check if the completed item was type `[spec]` or `[refine]`, and no `[implement]` item for the same path already exists in `taproot/plan.md`. If yes, present the completion prompt with a follow-on offer:
     ```
     ✓ Done — <description>
     M items remaining.
     [+] Add follow-on to plan  [R] Review written spec  [A] Continue to next  [D] Done for now
     ```
     Otherwise (item is `[implement]`, or an implement item for this path already exists):
     ```
     ✓ Done — <description>
     M items remaining.
     [R] Review written spec  [A] Continue to next  [D] Done for now
     ```
     - `[+]`: append an `implement afk` item for the same behaviour path to `taproot/plan.md` as a new `pending` item. Confirm: *"Added: [implement] afk <path>."* Then present the updated item count and offer `[A] Continue · [D] Done for now`.
     - `[R]`: invoke `/tr-browse <path>` on the spec just written (the path the skill targeted); let browse run to full completion. Then re-present this same prompt with all options intact — so the developer can keep reviewing before deciding. Omit `[R]` only if the item type is `[implement]` and no spec path is associated.
     - `[A]`: continue to next item
     - `[D]` or no items remain: report final status (see step 8)
   - **AFK-only**, or **batch mode with an `afk` item**: mark done and proceed to next item without waiting.

8. **Report final status** when done or stopped:
   - All items executed: *"Plan complete — all N items executed."*
   - Stopped early: *"Stopped after N items — M items remaining."*
   - HITL pass: *"HITL pass complete — N items done. M afk items remain pending."*
   - AFK pass: *"AFK pass complete — N items done. M hitl items remain pending."*
   - Specify pass: *"Specify pass complete — N items done. M implement items remain pending."*
   - Implement pass: *"Implement pass complete — N items done. M spec/refine items remain pending."*

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next item.

   **What's next?**
   [1] Continue executing — call `/tr-plan-execute` again for remaining items
   [2] `/tr-plan` — add more items to the plan

## Output

Updates `taproot/plan.md` in-place — replaces `pending` with `done`, `deferred`, `dropped`, `blocked`, or `stale` for each processed item.

## CLI Dependencies

None

## Notes

- In batch mode, the developer confirms the whole list up-front. The agent still presents each item before invoking its skill — per-item visibility is preserved. Batch pauses on `hitl` items (they require human decisions during execution).
- HITL mode is always step-by-step — batch is meaningless for items that require human decisions.
- AFK mode is always batch — the whole point of `afk` items is that the agent executes them without per-item prompting. The upfront list confirmation in step 6 is the only human touchpoint.
- Specify and implement modes are filters, not separate modes. Filtered-out items stay `pending` (not `deferred`) so they can be processed in a later pass.
- `deferred` means "do later" — item is carried forward to future plans. `dropped` means "intentionally excluded" — item won't reappear unless manually re-added.
- A typical two-pass workflow: run HITL mode to work through human-decision items, then run AFK mode to execute all autonomous items without interruption.
- Autonomous execution (agent works through all items without any human confirmation) is explicitly out of scope.
