# Skill: plan-build

## Description

Build or modify the persistent implementation plan (`taproot/plan.md`). Invoke this skill whenever the developer says "plan X", "create a plan for Y", "make a plan", "add X to plan", "rework the plan", "change the plan to prioritise X", "reorder the plan", or any similar plan-creation or plan-modification phrase. Do not generate a plan as inline chat text — always route through this skill and write `taproot/plan.md`.

Sources: backlog items, unimplemented hierarchy behaviours, or developer-supplied items. Each item is typed (`spec`, `implement`, or `refine`) and sequenced so prerequisites come first.

## Inputs

- `source` (optional): `backlog`, `hierarchy`, or leave blank to let the developer specify in natural language

## Steps

0. **Detect modification request.** If the developer's request is a plan modification ("rework the plan", "change the plan to prioritise X", "move X earlier", "remove X from plan", "reorder", or similar) and `taproot/plan.md` already exists:
   - Read `taproot/plan.md`.
   - Present the proposed changes (items added, removed, or reordered).
   - Wait for confirmation.
   - On confirm: write the modified `taproot/plan.md` and report: *"Plan updated — N items."* Stop.
   - On abort: stop — no files modified.

0a. **Detect vertical slice request.** If the developer's request uses phrases like "vertical slice", "walking skeleton", "tracer bullet", "thin slice", "minimal path", "just enough to demo", or similar:
  1. Ask: *"Vertical slice — I need three things: **Actor** (who initiates), **Entry point** (where the flow begins), and **Observable outcome** (what the actor sees when it works)."*
  2. Wait for the developer to supply the three inputs.
  3. Scan the hierarchy (`node dist/cli.js coverage`) and `taproot/backlog.md` to identify behaviours on the critical path — those whose absence would prevent the actor from reaching the observable outcome via the entry point. Non-critical-path behaviours are excluded entirely.
  4. Classify critical-path items using the same heuristics as step 3 (`spec`/`implement`/`refine`, `hitl`/`afk`).
  5. Present the filtered plan:
     ```
     Vertical slice — actor: <actor> · entry: <entry point> · outcome: <observable outcome>
     N critical-path items:
      1. hitl  [spec]      "description"
      2. afk   [implement] <intent>/<behaviour>/
     [A] Confirm  [E] Edit directly then reply A  [Q] Abort
     ```
     Wait for confirmation. On `[Q]`: stop — no files written. On `[E]`: wait for edits.
  6. If `taproot/plan.md` already exists, offer: `[A] Append new items · [R] Replace · [Q] Abort` before writing.
  7. Write `taproot/plan.md` with only the critical-path items:
     ```
     # Taproot Plan
     _Built: YYYY-MM-DD — N items (vertical slice)_
     _Slice: <actor> → <entry point> → <observable outcome>_
     _HITL = human decision required · AFK = agent executes autonomously_

     ## Items

     1. pending  [spec]      hitl  "description"
     2. pending  [implement] afk   <intent>/<behaviour>/
     ```
  8. Confirm: *"Plan saved — N items in `taproot/plan.md`."* Stop — do not continue to step 1.

1. **Determine sources.** Read the developer's request and identify which sources to scan:
   - **backlog** — read `taproot/backlog.md`; filter to actionable items
   - **hierarchy** — run `node dist/cli.js coverage` to find unimplemented or in-progress behaviours
   - **explicit** — use the items the developer named directly, without scanning

2. **Collect candidates.** For each source:
   - *backlog*: read `taproot/backlog.md`, one item per bullet/line. Skip blank lines and dated metadata lines. If `taproot/backlog.md` is absent, note *"backlog.md not found, treating as empty"* and continue.
   - *hierarchy*: run `node dist/cli.js coverage` and collect behaviours whose state is `proposed` (→ `refine`) or have no implementation yet (→ `implement` if usecase.md is `specified`, else → `spec`).
   - *explicit*: collect items the developer named; resolve each to a hierarchy path if one exists, or mark as `spec` if it doesn't.

3. **Classify each candidate by type and execution mode:**
   - Type:
     - **`spec`** — no `usecase.md` exists yet; first action is to write one with `/tr-behaviour`
     - **`implement`** — a `usecase.md` exists and is in `specified` state; ready to code
     - **`refine`** — a `usecase.md` exists but is in `proposed` or `draft` state; needs `/tr-refine` before implementing
   - Execution mode:
     - **`hitl`** (human-in-the-loop) — requires a human decision, design choice, or external action before or during execution. Signals: open-ended design, naming decisions, external setup (accounts, secrets, infrastructure), architectural trade-offs, or vague success criteria.
     - **`afk`** (away-from-keyboard) — agent can execute autonomously; success criteria are fully derivable from an existing spec with no open questions.
   - Default heuristics: `spec` → `hitl`; `refine` → `hitl`; `implement` → `afk` unless the impl has known external blockers or unresolved design questions.

4. **Sequence candidates.** `spec` and `refine` items that are prerequisites for `implement` items appear earlier in the list. Otherwise preserve source order.

5. **Present the proposed plan for review:**
   ```
   Proposed plan — N items:
    1. hitl  [spec]      "description of new item"
    2. hitl  [refine]    <intent>/<behaviour>/usecase
    3. afk   [implement] <intent>/<behaviour>/

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
   _HITL = human decision required · AFK = agent executes autonomously_

   ## Items

   1. pending  [spec]      hitl  "description of new item"
   2. pending  [implement] afk   <intent>/<behaviour>/
   3. pending  [refine]    hitl  <intent>/<behaviour>/usecase
   ```

   **Path format:** store abbreviated paths — strip the hierarchy root prefix (`taproot/` or `taproot/specs/`) and `.md` extension. Preserve trailing `/` for directory references. Expand to full path before passing to CLI commands.

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
- Vertical slice mode excludes non-critical-path behaviours entirely — they are not added to the plan as deferred or post-slice items. They remain in the hierarchy as unimplemented for future planning sessions.
