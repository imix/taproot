# Skill: arch-test-structure

## Description

Elicit and capture test structure and placement conventions for the project: where test files live, how they are named, and what structural rules govern test organisation. Covers the structural half of testing only — strategy, mocking policy, and coverage targets belong in a future `testing` module. Writes `arch-test-structure_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-test-structure_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for test structure patterns:
   - Test file locations (co-located with source, in a top-level `tests/` directory, in `__tests__/` subdirectories, etc.)
   - Test file naming conventions (`*.test.ts`, `*_test.go`, `*Spec.scala`, `test_*.py`, etc.)
   - Fixture and test helper locations
   - Test dependency management (test-only dependencies, test utilities, shared setup)

   Report what was found with source file references.

3. Ask targeted questions:

   > **Test structure conventions**
   >
   > Answer each that applies; skip any that don't:
   >
   > - Where do test files live relative to source files? (co-located alongside source, in a top-level tests/ directory, mirrored directory structure)
   > - What naming convention do test files follow? (e.g. `<name>.test.ts`, `<name>_test.go`, `test_<name>.py`)
   > - Where do test fixtures and shared test helpers live?
   > - Are test-only dependencies allowed in production bundles? (no, allowed, not applicable)
   > - Is there a rule about test file size or splitting? (one test file per source file, split by scenario, no rule)
   > **[H]** Get help — agent will propose defaults based on codebase patterns

   On **[H]**: scan test file locations and naming in the codebase; propose conventions; developer confirms or adjusts.

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `arch-test-structure_behaviour.md` content:

   ```markdown
   ## Test structure conventions

   ### Test file placement
   [Where test files live relative to source files]

   ### Test file naming
   [Naming convention for test files]

   ### Fixtures and helpers
   [Where test fixtures and shared helpers live]

   ### Test dependency isolation
   [Whether test-only dependencies are allowed in production bundles]

   ### Test file organisation
   [Any rule about test file size or splitting, or "No rule"]

   ## Agent checklist

   When writing tests for any implementation:
   - [ ] Are test files placed in the correct location per the placement convention?
   - [ ] Do test file names follow the naming convention?
   - [ ] Are fixtures and shared helpers in the designated location?
   - [ ] Are test-only dependencies excluded from production bundles (if required)?
   ```

   Note at the bottom: "For testing strategy (what to test, mocking policy, coverage targets) — see the `testing` module when available."

6. If `arch-test-structure_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-test-structure_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-test-structure_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-test-structure_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-naming` — define naming conventions
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-test-structure_behaviour.md` — conventions and agent checklist for test structure and placement.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- Scope is deliberately limited to structure and placement — where tests live and how they are named. Strategy questions (what to test, how to test, mocking, coverage) belong in a future `testing` module. If the developer raises strategy questions, note them in the truth file under an "Out of scope — testing module" comment.
