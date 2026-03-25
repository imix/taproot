# Skill: review

## Description

Stress-test a single Taproot artifact — an `intent.md`, `usecase.md`, or `impl.md` — by challenging it from multiple angles. Produces a structured critique with prioritized findings. Does **not** auto-modify the artifact; the user decides what to act on.

## Inputs

- `path` (required): Path to a Taproot artifact (`intent.md`, `usecase.md`, or `impl.md`).

## Steps

1. Read the artifact at `path`. Identify its type by filename.

2. If the artifact has a parent (e.g., a `usecase.md` has a parent `intent.md`), read the parent to understand context. If siblings exist (other behaviours under the same intent), read those too — cross-checking is part of a thorough review.

3. Apply the challenge set appropriate to the artifact type:

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

5. Present findings in priority order (blockers first), using concrete examples from the artifact text. For each finding, quote the specific line or section being challenged.

6. Present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-refine <path>` — apply the findings to the spec
   [B] `/tr-implement <path>/` — spec is clean; proceed to implementation
   [C] `/tr-backlog <finding>` — capture an out-of-scope issue for later without routing it now

## Output

A structured critique report with findings grouped as **Blockers**, **Concerns**, and **Suggestions**. Each finding quotes the relevant artifact text and explains the risk.

The artifact is NOT modified.

## CLI Dependencies

None during review. The user then decides whether to run:
- `taproot validate-format` (to check current state)
- `/taproot:refine` (to apply suggested changes)
- `/taproot:intent` (to revise the intent)

## Notes

- Do not soften the critique. The purpose is to find real problems before implementation, not to validate the work. A review that finds nothing is not a success — it means you weren't looking hard enough.
- If the artifact is clearly a placeholder or stub (lots of `<placeholder>` text), flag this explicitly rather than reviewing the placeholders themselves.
