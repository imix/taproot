# Skill: arch-module-boundaries

## Description

Elicit and capture module boundary conventions for the project: how the codebase is divided into layers or modules, what each layer is responsible for, and what cross-boundary dependencies are permitted. Writes `arch-module-boundaries_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-module-boundaries_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for module/layer structure:
   - Top-level directory organisation (`src/`, `lib/`, `pkg/`, `cmd/`, etc.)
   - Named layers or tiers (controllers, services, repositories, handlers, adapters, etc.)
   - Import patterns (which directories import from which)
   - Any existing architecture docs or ADRs describing layer structure

   Report what was found with source file references.

3. Ask targeted questions:

   > **Module boundary conventions**
   >
   > Answer each that applies; skip any that don't:
   >
   > - What are the named layers or modules in this codebase? (e.g. commands, core, validators, adapters)
   > - What is each layer's primary responsibility? (one sentence each)
   > - Which cross-layer imports are explicitly permitted? (e.g. commands may import core; core must not import commands)
   > - Which cross-layer imports are forbidden?
   > - What is the convention when a lower layer needs something from a higher layer? (inversion of control, event, callback, dependency injection)
   > **[H]** Get help — agent will map the existing layer structure

   On **[H]**: scan import patterns across the codebase; map the observed layer structure; propose conventions; developer confirms or adjusts.

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `arch-module-boundaries_behaviour.md` content:

   ```markdown
   ## Module boundary conventions

   ### Layer map
   | Layer | Path | Responsibility |
   |---|---|---|
   [one row per layer]

   ### Permitted imports
   [Which layers may import from which]

   ### Forbidden imports
   [Which cross-layer imports are not allowed]

   ### Upward dependency handling
   [How a lower layer gets something it needs from a higher layer]

   ## Agent checklist

   Before implementing any module, class, or function:
   - [ ] Does this code belong in the correct layer given its responsibility?
   - [ ] Do all imports respect the permitted-imports rule?
   - [ ] Are there any forbidden cross-layer imports introduced?
   - [ ] If a lower layer needs something from a higher layer, is the upward dependency handling convention followed?
   ```

6. If `arch-module-boundaries_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-module-boundaries_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-module-boundaries_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-module-boundaries_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-error-handling` — define error handling conventions
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-module-boundaries_behaviour.md` — conventions and agent checklist for module boundaries.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator.
- The layer map format mirrors the one in `docs/architecture.md` for taproot itself — propose that format by default.
