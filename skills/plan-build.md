# Skill: plan-build

## Description

Build a persistent implementation plan (`taproot/plan.md`) from backlog items, unimplemented hierarchy behaviours, or developer-supplied items. Each item is typed (`spec`, `implement`, or `refine`) and sequenced so prerequisites come first.

## Inputs

- `source` (optional): `backlog`, `hierarchy`, or leave blank to let the developer specify in natural language

## Steps

1. **Determine sources.** Read the developer's request and identify which sources to scan:
   - **backlog** — read `taproot/backlog.md`; filter to actionable items
   - **hierarchy** — run `node dist/cli.js coverage` to find unimplemented or in-progress behaviours
   - **explicit** — use the items the developer named directly, without scanning

2. **Collect candidates.** For each source:
   - *backlog*: read `taproot/backlog.md`, one item per bullet/line. Skip blank lines and dated metadata lines. If `taproot/backlog.md` is absent, note *"backlog.md not found, treating as empty"* and continue.
   - *hierarchy*: run `node dist/cli.js coverage` and collect behaviours whose state is `proposed` (→ `refine`) or have no implementation yet (→ `implement` if usecase.md is `specified`, else → `spec`).
   - *explicit*: collect items the developer named; resolve each to a hierarchy path if one exists, or mark as `spec` if it doesn't.

3. **Classify each candidate:**
   - **`spec`** — no `usecase.md` exists yet; first action is to write one with `/tr-behaviour`
   - **`implement`** — a `usecase.md` exists and is in `specified` state; ready to code
   - **`refine`** — a `usecase.md` exists but is in `proposed` or `draft` state; needs `/tr-refine` before implementing

4. **Sequence candidates.** `spec` and `refine` items that are prerequisites for `implement` items appear earlier in the list. Otherwise preserve source order.

5. **Present the proposed plan for review:**
   ```
   Proposed plan — N items:
    1. [spec]      "description of new item"
    2. [refine]    taproot/specs/<intent>/<behaviour>/usecase.md
    3. [implement] taproot/specs/<intent>/<behaviour>/

   [A] Confirm  [E] Edit directly then reply A  [Q] Abort
   ```
   Wait for developer response. Do not write any files before confirmation.

6. **Handle developer choice:**
   - **[E]**: wait for the developer to paste an edited list in the conversation, then treat it as the confirmed plan and continue to step 7.
   - **[Q]**: stop — no files written.
   - **[A]** or any affirmative: continue to step 7.

7. **Check for existing plan.** If `taproot/plan.md` already exists:
   - Report: *"A plan already exists with N items."*
   - Offer: `[A] Append new items · [R] Replace · [Q] Abort`
   - **[A]**: append only items not already present (match by type + path/description).
   - **[R]**: replace the file with the new plan.
   - **[Q]**: stop — no files modified.

8. **Write `taproot/plan.md`** using this format:
   ```
   # Taproot Plan

   _Built: YYYY-MM-DD — N items_

   ## Items

   1. pending  [spec]      "description of new item"
   2. pending  [implement] taproot/specs/<intent>/<behaviour>/
   3. pending  [refine]    taproot/specs/<intent>/<behaviour>/usecase.md
   ```

   Status values: `pending` · `done` · `skipped` · `blocked` · `stale`

9. **Remove consumed backlog items.** If any plan items were sourced from `taproot/backlog.md`, remove those lines from the file and report: *"Removed N item(s) from `taproot/backlog.md`."* Skip this step if no backlog items were used or if `taproot/backlog.md` is absent.

10. Confirm: *"Plan saved — N items in `taproot/plan.md`."*

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-plan-analyse` — check readiness of all items before executing
   [B] `/tr-plan-execute` — start executing items one by one

## Output

`taproot/plan.md` — an ordered list of typed, status-tracked action items.

## CLI Dependencies

- `taproot coverage`

## Notes

- Backlog removal applies only to items sourced from `taproot/backlog.md` — explicit items and hierarchy items have no backlog entry to remove.
- Dependency ordering is inferred by the agent, not formally declared in the plan file.
- Autonomous execution of plan items is out of scope — see `/tr-plan-execute` for confirmed step-by-step execution.
