# Skill: arch-code-reuse

## Description

Elicit and capture code reuse conventions for the project: when to abstract, how to discover existing abstractions, and how to prevent duplication. Writes `arch-code-reuse_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-code-reuse_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for reuse patterns:
   - Shared utility or helper modules (e.g. `src/utils/`, `lib/shared/`, `pkg/common/`)
   - Functions or classes duplicated across files (common sign: similar names in different modules)
   - Abstraction layers (base classes, mixins, higher-order functions, shared interfaces)
   - Inline code that could be extracted (repeated patterns within files)

   Report what was found with source file references.

3. Ask targeted questions:

   > **Code reuse conventions**
   >
   > Answer each that applies; skip any that don't:
   >
   > - Where do shared utilities and helpers live? (dedicated module, co-located, no formal rule)
   > - At what point does duplication warrant extraction? (immediately, after two occurrences, after three, never — always inline)
   > - What is the rule for discovering existing abstractions before writing new code? (search first, ask a reviewer, consult docs)
   > - What is the convention for copy-with-modification vs abstraction? (copy is allowed for small variations, extract when variation exceeds N lines)
   > - Are there domains or layers where duplication is explicitly acceptable? (e.g. test helpers, migration scripts)
   > **[?]** Get help — agent will propose defaults based on codebase patterns

   On **[?]**: scan for existing shared modules and duplication patterns; propose conventions; developer confirms or adjusts.

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `arch-code-reuse_behaviour.md` content:

   ```markdown
   ## Code reuse conventions

   ### Shared utilities location
   [Where shared utilities and helpers live]

   ### Duplication threshold
   [When duplication warrants extraction]

   ### Discovery rule
   [How to find existing abstractions before writing new code]

   ### Copy-with-modification policy
   [When copy is acceptable vs when to extract]

   ### Acceptable duplication zones
   [Domains or layers where duplication is explicitly allowed]

   ## Agent checklist

   Before implementing any non-trivial logic:
   - [ ] Has the codebase been scanned for an existing abstraction that covers this? (see discovery rule above)
   - [ ] If similar logic exists, does this implementation exceed the duplication threshold?
   - [ ] If extracting a shared abstraction: does it live in the designated shared location?
   - [ ] If copying with modification: does the variation stay within the copy-with-modification policy?
   ```

6. If `arch-code-reuse_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-code-reuse_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-code-reuse_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-code-reuse_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-dependency-governance` — define dependency governance conventions
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-code-reuse_behaviour.md` — conventions and agent checklist for code reuse.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- The discovery rule is the most important convention for agent behaviour at DoR time — it shapes the check: condition wired by `/tr-arch-define`.
