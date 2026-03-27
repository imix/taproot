# Skill: promote

## Description

Escalate a significant finding from implementation or behaviour level up to the intent. Use when implementation reveals that a higher-level assumption is wrong — not a detail-level bug, but a structural mismatch between what was intended and what is actually achievable or desirable.

## Inputs

- `path` (required): Path to the `impl.md` or `usecase.md` where the finding originated.
- `finding` (required): Description of the discovery that affects the parent intent.

## Steps

1. Read the artifact at `path`. Identify its type.

2. Walk up the hierarchy to find the parent `intent.md`. If `path` is an `impl.md`, walk up through the behaviour to the intent.

3. Read the `intent.md`. Identify which success criteria, goal statement, or constraints are affected by the finding.

4. Classify the finding's severity:
   - **Intent goal is unachievable as stated**: the goal cannot be reached given discovered constraints (technical, regulatory, dependency)
   - **Success criterion is unmeasurable or wrong**: a criterion turns out to be impossible to verify, or measures the wrong thing
   - **New constraint discovered**: a real-world constraint exists that the intent didn't account for (compliance requirement, third-party limitation, performance ceiling)
   - **Scope is wider than understood**: achieving the intent requires significantly more work than originally estimated
   - **Dependency discovered**: this intent cannot be achieved without another intent or external project being completed first

5. Draft the update to `intent.md`:
   - Add a **Review Note** to the Notes section (do not modify the Goal or Success Criteria directly without user confirmation):
     ```
     **Review Note (<date>):** <summary of finding and its impact>
     Source: <path-to-origin-artifact>
     ```
   - Update Status **State** to `active` if it was `draft` (the finding makes it concrete)
   - Update "Last reviewed" to today

6. Show the proposed changes. Ask: "Do you want me to also update the Goal/Success Criteria directly, or just add the review note for now?"

7. If the user wants to update Goal or Success Criteria, make those changes collaboratively, respecting the original intent while incorporating the finding.

8. List all behaviours under the affected intent. For each, assess whether the finding might require the behaviour to be re-evaluated:
   - "Behaviours that may need review given this finding:"
   - List each with a one-line explanation of why it might be affected

9. Write the updated `intent.md`.

10. Run `taproot validate-format --path <intent-folder>`.

11. Report: "Intent updated. <N> behaviours flagged for potential re-evaluation."

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

    **What's next?**
    [A] `/tr-refine taproot/<intent-slug>/<behaviour-slug>/` — refine the most-affected behaviour
    [B] `/tr-review taproot/<intent-slug>/intent.md` — stress-test the updated intent

## Output

An updated `intent.md` with a Review Note and updated status. A list of behaviours that may need re-evaluation.

Importantly, this skill does **not** auto-modify other behaviours — it creates a review task. The user decides what to act on.

## CLI Dependencies

- `taproot validate-format`

## Notes

- Use this skill when the finding changes the answer to "is this intent achievable?" or "are we building the right thing?" — not for normal implementation learnings (use `/taproot:refine` for those).
- If multiple findings accumulate in the Notes section without being resolved, that is a signal to run a full `/taproot:review` or `/taproot:review-all` on the intent.
