# Skill: arch-naming

## Description

Elicit and capture naming conventions for the project: how files, modules, types, functions, and variables are named. Writes `arch-naming_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-naming_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for naming patterns:
   - File naming patterns (kebab-case, snake_case, PascalCase, camelCase per file type)
   - Directory naming patterns
   - Type/class naming patterns
   - Function/method naming patterns
   - Variable and constant naming patterns
   - Any abbreviation or acronym conventions

   Report what was found with source file references.

3. Ask targeted questions:

   > **Naming conventions**
   >
   > Answer each that applies; skip any that don't:
   >
   > - What casing convention applies to source files? (kebab-case, snake_case, PascalCase, camelCase)
   > - What casing convention applies to directories/modules? (same as files, or different)
   > - What convention applies to type and class names?
   > - What convention applies to function and method names?
   > - What abbreviation policy applies? (no abbreviations except a permitted list, abbreviations allowed for common terms, free)
   > - Are there naming rules for specific categories? (e.g. booleans start with is/has, event handlers start with on, interfaces start with I)
   > **[H]** Get help — agent will infer conventions from codebase patterns

   On **[H]**: scan naming patterns across the codebase; identify the dominant conventions; propose a rule set; developer confirms or adjusts.

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `arch-naming_behaviour.md` content:

   ```markdown
   ## Naming conventions

   ### File naming
   [Casing convention for source files, with examples]

   ### Directory and module naming
   [Casing convention for directories and modules]

   ### Type and class naming
   [Convention for type names, interfaces, classes]

   ### Function and method naming
   [Convention for functions and methods]

   ### Variable and constant naming
   [Convention for variables, constants, enums]

   ### Abbreviation policy
   [Whether abbreviations are allowed and which are permitted]

   ### Category-specific rules
   [Any naming rules for specific categories — booleans, handlers, etc. — or "None"]

   ## Agent checklist

   When naming any new file, module, type, function, or variable:
   - [ ] Does the name follow the casing convention for its category?
   - [ ] Does the name comply with the abbreviation policy?
   - [ ] If this item falls into a named category (boolean, handler, etc.), does the name follow the category rule?
   - [ ] Is the name consistent with existing similar items in the codebase?
   ```

6. If `arch-naming_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-naming_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-naming_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-naming_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-define` — return to module orchestrator to complete session
> [2] `/tr-commit` — commit the new truth file
> [3] `/tr-status` — view coverage snapshot

## Output

`taproot/global-truths/arch-naming_behaviour.md` — conventions and agent checklist for naming.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- Naming conventions often have exceptions by file type or context. If the developer describes exceptions, include them as sub-rules under the relevant section rather than treating them as contradictions.
