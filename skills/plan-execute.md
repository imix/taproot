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
   - *"hitl only"* / *"run human items"* / *"interactive only"* → **hitl** (filter: `hitl` items only)
   - *"afk only"* / *"run autonomous"* / *"implement automatically"* → **afk** (filter: `afk` items only)
   - *"bring all to specified"* / *"run spec and refine only"* / *"specify mode"* → **specify** (filter: `spec` + `refine` types only)
   - *"implement all specified"* / *"implement all"* / *"run implement only"* → **implement** (filter: `implement` type only)
   - No mode specified (bare `/tr-plan-execute` or ambiguous): → **show orientation** (step 3a)

   **3a. Orientation** (only when no mode is specified): count pending items by execution mode and present the mode menu:
   ```
   Plan: N items pending (X hitl · Y afk)

   How would you like to proceed?
   [A] Step-by-step     — one item at a time, confirm each (default)
   [B] Batch            — confirm full list upfront, then run all
   [C] HITL only        — human-decision items only
   [D] AFK only         — autonomous items only
   [Q] Cancel
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

6. **In batch mode**, present the full filtered list first and wait for confirmation:
   ```
   Executing N items:
    1. [spec]      "description"
    2. [implement] taproot/specs/<intent>/<behaviour>/
   ...
   [A] Begin  [Q] Abort
   ```
   If `[Q]`: stop — no changes made.

7. **For each pending item** (in plan order, respecting the filter):

   **a. Present the item** (always — even in batch mode, each item is shown before its skill runs):
   ```
   Next: [implement] taproot/specs/<intent>/<behaviour>/ — <description>
   Skill: /tr-implement
   [A] Proceed  [S] Skip  [Q] Stop
   ```

   **b. In step-by-step mode**, wait for developer response:
   - `[A]` or affirmative: proceed to c
   - `[S]`: mark item `skipped` in `taproot/plan.md`; move to next item
   - `[Q]`: stop — remaining items stay `pending`

   **c. Invoke the skill** based on item type:
   - `[spec]` → `/tr-behaviour <path> "<description>"`
   - `[implement]` → `/tr-implement <path>`
   - `[refine]` → `/tr-refine <path>`

   **d. Mandatory commit gate**: immediately after skill completion, invoke `/tr-commit`. This step is **not optional** — do not mark the item `done` until `/tr-commit` succeeds. Do not present the next item until the commit is complete.
   - If `/tr-commit` succeeds: mark the item `done` in `taproot/plan.md`.
   - If `/tr-commit` fails or is aborted: treat as blocked (step e). The item stays `in-progress` — not `done`, not `pending`.

   **e. On skill failure / unresolvable blocker**: mark the item `blocked` with a one-line note in `taproot/plan.md`. Report:
   > *"Item blocked: <reason>. Remaining items are unaffected."*
   - *Step-by-step*: offer `[A] Continue to next · [D] Stop`
   - *Batch*: pause and wait for developer to resolve before continuing

   **f. In step-by-step mode**, after each completed item:
   ```
   ✓ Done — <description>
   M items remaining.
   [A] Continue to next  [D] Stop for now
   ```
   - `[A]`: continue to next item
   - `[D]` or no items remain: report final status (see step 8)

   **g. In batch mode**: mark done and proceed to next item without waiting.

8. **Report final status** when done or stopped:
   - All items executed: *"Plan complete — all N items executed."*
   - Stopped early: *"Stopped after N items — M items remaining."*
   - HITL pass: *"HITL pass complete — N items done. M afk items remain pending."*
   - AFK pass: *"AFK pass complete — N items done. M hitl items remain pending."*
   - Specify pass: *"Specify pass complete — N items done. M implement items remain pending."*
   - Implement pass: *"Implement pass complete — N items done. M spec/refine items remain pending."*

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next item.

   **What's next?**
   [A] Continue executing — call `/tr-plan-execute` again for remaining items
   [B] `/tr-plan` — add more items to the plan

## Output

Updates `taproot/plan.md` in-place — replaces `pending` with `done`, `skipped`, `blocked`, or `stale` for each processed item.

## CLI Dependencies

None

## Notes

- In batch mode, the developer confirms the whole list up-front. The agent still presents each item before invoking its skill — per-item visibility is preserved.
- Specify and implement modes are filters, not separate modes. Filtered-out items stay `pending` (not `skipped`) so they can be processed in a later pass.
- A typical two-pass workflow: run specify mode to bring all specs to `specified`, then run implement mode to code them all.
- Autonomous execution (agent works through all items without any human confirmation) is explicitly out of scope.
