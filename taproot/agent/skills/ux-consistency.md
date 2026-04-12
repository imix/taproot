# Skill: ux-consistency

## Description

Elicit and capture consistency UX conventions for the project: shared-pattern vocabulary, deviation documentation, cross-surface alignment rules, and criteria for introducing new patterns. Writes `ux-consistency_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-consistency_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase and specs for recurring patterns:
   - Interactions appearing in 3 or more places: confirm-before-delete, inline edit, bulk actions, step sequences
   - Patterns that differ between surfaces — intentional or accidental divergence
   - Component reuse vs re-implementation of the same interaction

   Report candidate shared patterns with source references and usage count.

3. Ask targeted questions:

   > **Consistency conventions — [surface type]**
   >
   > - Which interaction patterns appear in multiple places and should be treated as shared conventions? (e.g. confirm-before-delete, inline edit, multi-select)
   > - How are deliberate deviations from established patterns documented and justified?
   > - Which patterns differ between surfaces — is that intentional?
   > - When should a new pattern be introduced vs adapting an existing one?
   > - How is pattern drift detected during implementation? (code review, design review, agent checklist)

   If candidate patterns were found in step 2, present them first:

   > "I found these recurring patterns — which should be formalised as shared conventions?"
   > [list candidates with usage count]
   > **[A]** Formalise all listed  **[E]** Choose selectively  **[C]** Start from scratch

4. Draft `ux-consistency_behaviour.md`:

   ```markdown
   ## Consistency conventions

   ### Shared pattern vocabulary
   [Patterns that are shared conventions — not re-implemented per feature]

   ### Deviation documentation
   [How intentional deviations from shared patterns are documented and justified]

   ### Cross-surface alignment
   [Which patterns apply across all surfaces; which legitimately differ and why]

   ### Pattern introduction criteria
   [When to introduce a new pattern vs extend an existing one]

   ## Agent checklist

   Before implementing any interaction:
   - [ ] Is there a shared pattern for this interaction? If yes, use it rather than re-implementing.
   - [ ] If deviating from an established pattern, is the deviation documented and justified?
   - [ ] If this interaction exists on multiple surfaces, does it follow the cross-surface alignment convention?
   - [ ] Is this a new pattern? Does it meet the criteria for introduction, or should an existing pattern be adapted?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-consistency_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-define` — return to module orchestrator (DoD wiring)
> [2] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-consistency_behaviour.md` — conventions and agent checklist for consistency patterns.

## CLI Dependencies

None.

## Notes

- This skill is typically run last in the module session — after other aspects have been defined, their patterns become candidates for consistency formalisation.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
