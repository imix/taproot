# Skill: arch-dependency-governance

## Description

Capture dependency governance conventions for the project: the rule that no dependency may be added without developer consent. Presents the standard convention text for confirmation rather than eliciting via questions. Writes `arch-dependency-governance_behaviour.md` to `taproot/global-truths/`.

## Inputs

- None required.

## Steps

1. Scan `taproot/global-truths/` for an existing `arch-dependency-governance_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for dependency signals:
   - Existing dependency manifest files (package.json, go.mod, requirements.txt, Cargo.toml, etc.)
   - Any existing dependency review or approval processes (CODEOWNERS, PR templates, lockfiles)
   - Comments or docs describing dependency policy

   Report what was found with source file references.

3. Present the standard convention text and DoD script option together in a single prompt:

   > **Dependency governance convention**
   >
   > The following convention will be written as a global truth:
   >
   > ---
   > *Never add a dependency without explicit developer consent. Before including any new library or package:*
   > *1. Confirm the dependency is not already available (directly or transitively)*
   > *2. Confirm the developer has approved the addition*
   > *3. Note the reason for the dependency in the implementation record*
   > ---
   >
   > **[A]** Write convention (no DoD script)
   > **[B]** Write convention + wire a DoD script at commit time
   > **[E]** Edit convention text before writing
   > **[C]** Cancel

   On **[E]**: developer provides adjusted convention text; present the updated text with options [A]/[B]/[C] again.

   On **[B]**: ask for the shell command that exits non-zero when unapproved dependencies appear. Note it for the truth file and for Phase 3 wiring in the orchestrator.

5. Draft the `arch-dependency-governance_behaviour.md` content:

   ```markdown
   ## Dependency governance conventions

   ### Core rule
   Never add a dependency without explicit developer consent. Before including any new library or package:
   1. Confirm the dependency is not already available (directly or transitively)
   2. Confirm the developer has approved the addition
   3. Note the reason for the dependency in the implementation record

   ### DoD verification command
   [command entered, or "None — rely on convention only"]

   ## Agent checklist

   Before adding any new dependency:
   - [ ] Is this dependency already available in the project (directly or as a transitive dependency)?
   - [ ] Has the developer explicitly approved this addition?
   - [ ] Is the reason for adding this dependency recorded in the impl.md?
   ```

6. If `arch-dependency-governance_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions   **[B]** Replace — overwrite   **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `arch-dependency-governance_behaviour.md`   **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/arch-dependency-governance_behaviour.md`. Report: "✓ Written: `taproot/global-truths/arch-dependency-governance_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-arch-module-boundaries` — define module boundary conventions
> [2] `/tr-arch-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/arch-dependency-governance_behaviour.md` — conventions and agent checklist for dependency governance.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-arch-define`, skip the What's next block and return control to the orchestrator. The orchestrator handles the DoD run: script wiring in Phase 3 — this sub-skill only writes the truth file and notes the command if provided.
- Unlike other sub-skills, this one does not use open-ended targeted questions — the governance convention is universal. The only variation is the optional DoD script command.
