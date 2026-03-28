# Skill: plan-analyse

## Description

Analyse `taproot/plan.md` before execution: check each pending item for readiness, flag ambiguous specs, unresolved dependencies, and missing prerequisites, and produce a per-item report so the developer knows what needs fixing before executing.

## Inputs

None required.

## Steps

1. **Check for plan.** If `taproot/plan.md` does not exist, report:
   > *"No plan found — build one first with `/tr-plan`."*
   Stop.

2. **Read `taproot/plan.md`.** Collect all items. If no `pending` items exist, report:
   > *"No pending items to analyse."*
   Suggest: *"Build a new plan with `/tr-plan`."* Stop.

3. **Evaluate readiness for each pending item:**

   **`[spec]` items:**
   - Is the description specific enough to write a `usecase.md`? Does it name an actor and a goal?
   - Flag ⚠ if the description is vague, names no actor, or has no clear success outcome.

   **`[implement]` items:**
   - Does the referenced `usecase.md` exist at the given path?
   - Is it in `specified` or `implemented` state? Flag ⚠ if it is `draft` or `proposed`.
   - Does the spec have open questions (unresolved `?` markers, `TBD` entries, or `proposed` sub-behaviours)? Flag ⚠ if found.
   - Flag ✗ if `usecase.md` is missing entirely.

   **`[refine]` items:**
   - Does the referenced spec exist?
   - Is there enough context in the item description to know what to refine?
   - Flag ⚠ if the description is too vague to guide refinement.
   - Flag ✗ if the spec is missing.

   **Dependency check (all types):**
   - If this item depends on an earlier plan item (inferred by position: a `[spec]` or `[refine]` item for the same path appearing earlier in the list), is that predecessor `done` or `specified`?
   - Flag ✗ if the predecessor is still `pending`.

4. **Build the readiness report:**
   ```
   Plan Analysis — N pending items

   ✓ Ready (N)
     · [implement] taproot/<intent>/<behaviour>/ — spec specified, no open questions

   ⚠ Needs attention (N)
     · [implement] taproot/<intent>/<behaviour>/ — spec is 'proposed', run /tr-refine first
     · [spec] "add login flow" — description is vague: actor and success criteria unclear

   ✗ Blocked (N)
     · [implement] taproot/<intent>/<behaviour>/ — depends on item 2 which is not yet done
   ```
   For each flagged item, append a one-line suggested action (e.g. `/tr-refine <path>`, `/tr-behaviour <path>`, "clarify actor and goal").

5. **Summarise:**
   - If all items are ready: *"All N pending items are ready — no blockers or ambiguities found."* Offer: *"[A] Execute now → `/tr-plan-execute`"*
   - Otherwise: *"N items ready, N need attention, N blocked. Suggested: resolve ⚠ and ✗ items before executing."*

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-plan-execute` — execute the plan (after resolving flagged items)
   [B] `/tr-plan` — rebuild or add items to the plan

## Output

A readiness report printed in the conversation — no files modified.

## CLI Dependencies

None

## Notes

- This behaviour is read-only — it never modifies `taproot/plan.md` or any hierarchy document.
- Stale paths (referenced file no longer exists) are flagged inline; analysis continues for remaining items.
- For large plans (>10 items), group by readiness category rather than plan order.
