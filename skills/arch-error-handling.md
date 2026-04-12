# Skill: arch-error-handling

## Description

Elicit and capture error handling strategy conventions for the project: where errors are caught, how they propagate, and what the standard recovery and reporting patterns are. Writes `arch-error-handling_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-error-handling_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for error handling patterns:
   - Try/catch or recover blocks and where they appear
   - Error type hierarchies or custom error classes
   - Logging of errors (where, at what level)
   - Error propagation patterns (re-throw, wrap, transform, swallow)
   - User-facing error messages vs internal error details

   Report what was found with source file references.

3. Ask targeted questions:

   > **Error handling strategy**
   >
   > Answer each that applies; skip any that don't:
   >
   > - Where in the call stack should errors be caught? (at entry points only, at each layer boundary, as close to the source as possible)
   > - How are errors propagated between layers? (re-thrown as-is, wrapped with context, transformed to a domain error type, returned as a value)
   > - What is the convention for user-facing error messages vs internal error details? (separate, redacted, structured)
   > - How are unexpected errors (bugs, panics) handled at the top level? (logged + exit, logged + reported, swallowed with fallback)
   > - Are there error categories with different handling rules? (e.g. validation errors vs system errors vs network errors)
   > **[?]** Get help — agent will propose defaults based on codebase patterns

   On **[?]**: scan error handling in existing code; identify the dominant strategy; propose conventions; developer confirms or adjusts.

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `arch-error-handling_behaviour.md` content:

   ```markdown
   ## Error handling strategy

   ### Catch boundary
   [Where errors are caught in the call stack]

   ### Propagation convention
   [How errors move between layers]

   ### User-facing vs internal errors
   [How user-visible messages differ from internal details]

   ### Top-level error handling
   [What happens to unexpected errors at the process/request boundary]

   ### Error categories
   [Any categories with distinct handling rules, or "No category distinction"]

   ## Agent checklist

   When implementing any code that can fail:
   - [ ] Is the catch boundary in the right place per the convention?
   - [ ] Is the propagation style (re-throw / wrap / transform / return) consistent with the convention?
   - [ ] Are user-facing messages separated from internal error details?
   - [ ] Are unexpected errors handled at the top level according to the convention?
   - [ ] If this error falls into a named category, is the category-specific handling applied?
   ```

6. If `arch-error-handling_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-error-handling_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-error-handling_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-error-handling_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-test-structure` — define test structure conventions
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-error-handling_behaviour.md` — conventions and agent checklist for error handling strategy.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- Adapt question language to the stack: "try/catch" for JS/Java/C#; "recover/defer" for Go; "Result/Option" for Rust; "rescue/raise" for Ruby.
