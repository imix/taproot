# Skill: arch-interface-design

## Description

Elicit and capture interface design conventions for the project: how public interfaces are structured, how contracts are defined, and how consistency is maintained across boundaries. Writes `arch-interface-design_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-interface-design_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for interface patterns:
   - Public function/method signatures and how they handle inputs/outputs
   - Error return conventions (exceptions, error codes, Result types, error objects)
   - Versioning signals (version prefixes, deprecation markers, changelogs)
   - Consistency patterns across similar interfaces (naming, parameter order, return shape)
   - Any existing interface documentation (OpenAPI specs, TypeDoc, godoc, etc.)

   Report what was found with source file references.

3. Ask targeted questions:

   > **Interface design conventions**
   >
   > Answer each that applies; skip any that don't:
   >
   > - How are errors communicated across interface boundaries? (exceptions, Result/Either types, error codes, error objects)
   > - How is breaking vs non-breaking change distinguished? (semver, version prefixes, deprecation policy)
   > - What naming pattern governs interface entry points? (verb-noun, noun-verb, noun-only, imperative)
   > - How are optional vs required parameters handled? (overloads, option objects, defaults, builder pattern)
   > - What consistency rules apply across similar interfaces? (parameter order, return shape, error shape)
   > **[H]** Get help — agent will propose defaults based on codebase patterns

   On **[H]**: scan existing interfaces for dominant patterns; propose conventions with rationale; developer confirms or adjusts.

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `arch-interface-design_behaviour.md` content:

   ```markdown
   ## Interface design conventions

   ### Error communication
   [How errors are returned/thrown across boundaries]

   ### Versioning and breaking changes
   [How breaking vs non-breaking changes are distinguished]

   ### Naming patterns
   [Naming rules for interface entry points]

   ### Parameter conventions
   [How optional/required parameters are handled]

   ### Consistency rules
   [Cross-interface consistency requirements]

   ## Agent checklist

   Before implementing any public interface or entry point:
   - [ ] Does the error communication follow the project convention? (exceptions / Result type / error code)
   - [ ] If this is a breaking change, is it versioned or deprecated according to the versioning convention?
   - [ ] Do parameter names and order follow the naming convention?
   - [ ] Does the return shape match the pattern used by similar interfaces?
   - [ ] Is optional vs required signalled consistently with existing interfaces?
   ```

6. If `arch-interface-design_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-interface-design_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-interface-design_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-interface-design_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-code-reuse` — define code reuse conventions
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-interface-design_behaviour.md` — conventions and agent checklist for interface design.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- Adapt questions to the confirmed stack: "exceptions" for Java/Python/Ruby; "Result type" for Rust/Go/Swift; "error codes" for C/C++.
