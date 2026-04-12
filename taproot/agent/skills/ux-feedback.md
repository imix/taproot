# Skill: ux-feedback

## Description

Elicit and capture feedback UX conventions for the project: success/error/warning hierarchy, loading states, inline vs global error placement, and partial-outcome handling. Writes `ux-feedback_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-feedback_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for feedback patterns:
   - Success messages, toast/banner notifications, inline confirmations
   - Error messages: field-level, form-level, page-level, system-level
   - Loading spinners, progress bars, skeleton states, background-operation notifications
   - Warning vs error vs informational distinctions
   - Partial-success handling (some items succeeded, some failed)

   Report what was found with source file references.

3. Ask targeted questions:

   > **Feedback conventions — [surface type]**
   >
   > - How are success outcomes communicated? (inline confirmation, banner, toast, redirect with message, exit code 0 + output)
   > - How are errors surfaced — at field level, section level, or page/command level?
   > - What does a long-running operation look like to the user? (spinner, progress bar, background task, silent with notification)
   > - How are recoverable errors distinguished from fatal ones?
   > - When is it a warning vs an error vs informational feedback?
   > - How are partial successes communicated? (e.g. 3 of 5 items updated)

4. Draft `ux-feedback_behaviour.md`:

   ```markdown
   ## Feedback conventions

   ### Success
   [How successful outcomes are communicated]

   ### Errors
   [Field-level, section-level, and system-level error presentation]

   ### Warnings and informational feedback
   [How warnings and info messages differ from errors]

   ### Loading and long operations
   [What long-running operations look like to the user]

   ### Partial outcomes
   [How mixed success/failure results are communicated]

   ## Agent checklist

   Before implementing any action that produces a result:
   - [ ] Does this action have a success state? Does it follow the success-feedback convention?
   - [ ] Can this action fail? Are errors shown at the right level (field, section, system)?
   - [ ] Is this operation long-running? Is a loading state required?
   - [ ] Can this action partially succeed? Is the partial-outcome convention applied?
   - [ ] Is the feedback type correct — error, warning, or informational?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-feedback_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-input` — define input conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-feedback_behaviour.md` — conventions and agent checklist for feedback patterns.

## CLI Dependencies

None.

## Notes

- Error copy tone is governed by both this skill and `/tr-ux-language`. If language conventions exist, reference them in the feedback truth file rather than duplicating tone rules.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
