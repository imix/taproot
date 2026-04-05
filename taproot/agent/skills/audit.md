# Skill: audit

## Description

Stress-test a single Taproot artifact — an `intent.md`, `usecase.md`, or `impl.md` — by challenging it from multiple angles. Presents findings one at a time with a proposed fix and recommended action per finding. The user triages each finding interactively; only accepted findings carry to `/tr-refine`.

## Inputs

- `path` (required): Path to a Taproot artifact (`intent.md`, `usecase.md`, or `impl.md`).

## Steps

1. Read the artifact at `path`. Identify its type by filename. If the artifact is a placeholder or stub (lots of `<placeholder>` text), report: "This artifact is a placeholder — audit findings would not be meaningful. Write the spec first, then audit." Stop.

2. If the artifact has a parent (e.g., a `usecase.md` has a parent `intent.md`), read the parent to understand context. Intents have no parent — skip for intents. If siblings exist (other behaviours under the same intent), read those too — cross-checking is part of a thorough review.

3. Apply the challenge set appropriate to the artifact type and generate findings internally. Do **not** present findings yet.

   **For `intent.md`:**
   - Is the goal measurable? Can you unambiguously declare it achieved?
   - Are the success criteria specific enough, or can you hit them without delivering real value?
   - Who is missing from the stakeholder list? (security team? operations? legal? downstream systems? support?)
   - What happens if this is never built? Is the status quo actually acceptable, or is the cost of inaction undersold?
   - Is this one intent or multiple intents in a trenchcoat? (Signs: "and" in the goal, >4 success criteria, multiple unrelated stakeholder groups)
   - What is the smallest version of this that would deliver value? Is the current scope justified?
   - Do any success criteria contradict each other, or compete for the same finite resource (time, budget, attention)?
   - Are the constraints real constraints (regulatory, physical, contractual) or assumed constraints that should be challenged?

   **For `usecase.md`:**
   - Does every step in the main flow have a clear actor and a clear outcome?
   - What happens when step N fails? Map every failure mode — missing network, invalid state, concurrent users, timeout.
   - What are the performance expectations? Is 100ms acceptable? 10 seconds? Does it matter? (Unstated = undefined = will cause conflict later.)
   - How does this behave under load? Concurrent executions? Race conditions on shared state?
   - What data does this touch, and what happens if that data is malformed, missing, or stale?
   - Is this one UseCase or two? (Signs: "or" in the main flow, alternate flow that rewrites most of the main flow, two distinct actors)
   - What happens at the boundaries — first use ever, N+1th use, quota exhaustion, rollback after failure?
   - Are the postconditions complete? Does something need to be notified? Logged? Cleaned up?
   - Do the error conditions cover all failure modes discovered above, with specific system responses?

   **For `impl.md`:**
   - Is each design decision justified by the usecase requirements, or is it "we always do it this way"?
   - What are the failure modes of the chosen approach? Under what conditions does it break?
   - Are the tests verifying observable behaviour from the actor's perspective, or are they testing implementation details?
   - What is NOT covered by the listed tests that should be? (Error paths, concurrent access, edge inputs, integration with external systems)
   - Will this implementation survive the next likely change to the behaviour spec? (e.g., if a new actor is added, or a new postcondition)
   - Are the source files listed complete? Could the behaviour actually be satisfied by these files, or are there missing dependencies?
   - Do the commits listed account for all the code in the source files? Are there uncommitted changes?

4. Categorize every finding:
   - **Blocker** — must be resolved before proceeding (spec is incomplete or contradictory in a way that will cause implementation failures)
   - **Concern** — should be addressed soon (spec has a gap or assumption that will likely cause problems)
   - **Suggestion** — worth considering (improvement that reduces risk or improves clarity, but not urgent)

   For each finding, also prepare:
   - The quoted artifact excerpt being challenged
   - The challenge — why this is a problem
   - A **proposed fix** — the specific wording change, addition, or removal that would resolve the finding
   - A **recommended action** (accept, dismiss, or defer) with a one-line reason

   Sort findings: Blockers first, then Concerns, then Suggestions.

5. **Interactive walkthrough** — present findings one at a time. For each finding, show:

   ```
   **<Category>** (<N of M>) — Recommendation: **<Accept/Dismiss/Defer>**

   > "<quoted artifact excerpt>"

   <Challenge — why this is a problem>

   **Proposed fix:** <specific change to make>

   [A] Accept — apply the proposed fix  [X] Dismiss — not relevant  [E] Edit — change the fix before accepting  [L] Later — capture to backlog
   ```

   Process the developer's response:
   - **[A] Accept** or **Enter** (accepts the recommendation): record the finding and its proposed fix as accepted
   - **[X] Dismiss**: record as dismissed, move to next finding
   - **[E] Edit**: ask the developer to reword the fix, record the edited version as accepted
   - **[L] Later**: capture to `taproot/backlog.md` via `/tr-backlog` with the finding text, move to next
   - **"go"** or **"apply remaining"**: apply the agent's recommended action for each remaining finding (accept, dismiss, or defer as recommended), then show the triage summary

6. **Triage summary** — after all findings are triaged, show:

   ```
   Triage complete: N accepted, N dismissed, N deferred
   ```

7. Present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [1] `/tr-refine <path>` — apply the N accepted findings to the spec
   [2] `/tr-implement <path>/` — spec is clean; proceed to implementation
   [3] `/tr-backlog` — review deferred items
   [P] Plan these — build a `taproot/plan.md` from the accepted findings

   When the developer selects [1], pass **only the accepted findings with their proposed fixes** as context to `/tr-refine`. Dismissed findings are not passed.

## Output

An interactive triage session where each finding is presented individually with a proposed fix and recommendation. The developer triages each finding. Accepted findings carry as structured input to `/tr-refine`.

The artifact is NOT modified by the audit itself.

## CLI Dependencies

None during review. The user then decides whether to run:
- `/taproot:refine` (to apply accepted findings)
- `/taproot:implement` (to proceed to implementation)

## Notes

- Do not soften the critique. The purpose is to find real problems before implementation, not to validate the work. A review that finds nothing is not a success — it means you weren't looking hard enough.
- The proposed fix per finding is **not optional**. Every finding must include a concrete change — "this is vague" is not actionable; "change X to Y" is. Without a proposed fix, [A] Accept has no clear meaning for downstream `/tr-refine`.
- Finding order matters: Blockers first forces the developer to confront the most important issues before fatigue sets in on Suggestions.
- The "go" / "apply remaining" batch escape applies the agent's recommendations for remaining findings — the agent has already done the analysis, so the developer only needs to override where they disagree.
- The agent's recommendation per finding reduces cognitive load: instead of evaluating each finding from scratch, the developer reviews a proposal and confirms or overrides.
