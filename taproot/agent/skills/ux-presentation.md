# Skill: ux-presentation

## Description

Elicit and capture presentation UX conventions for the project: layout structure, information hierarchy signals, density defaults, progressive disclosure, and collection display choices. Writes `ux-presentation_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-presentation_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for presentation patterns:
   - Layout structures: single column, sidebar, grid, command output columns
   - Information hierarchy: heading levels, weight, indentation, visual grouping
   - Content density: padding, spacing, line height, compactness choices
   - Progressive disclosure: expandable sections, detail views, tooltips, `--verbose` flags
   - Collection display: lists vs card grids vs structured views

   Report what was found with source file references.

3. Ask targeted questions:

   > **Presentation conventions — [surface type]**
   >
   > - What is the primary layout structure? (single column, sidebar+content, grid, columnar output)
   > - How is information hierarchy communicated? (heading levels, bold/dim, indentation, separators)
   > - When is information collapsed or hidden behind progressive disclosure? (expandable section, detail view, `--verbose`)
   > - How dense is the default view — compact, comfortable, or spacious?
   > - What distinguishes primary content from secondary or supporting content?
   > - How are lists, card grids, and structured views chosen for displaying collections?

4. Draft `ux-presentation_behaviour.md`:

   ```markdown
   ## Presentation conventions

   ### Layout structure
   [Primary layout and structure]

   ### Information hierarchy
   [How hierarchy is communicated visually or through formatting]

   ### Progressive disclosure
   [What triggers showing more detail and how it is surfaced]

   ### Density
   [Default density setting and how to vary it]

   ### Collection display
   [When to use lists, card grids, or structured views]

   ## Agent checklist

   Before implementing any view, screen, or output format:
   - [ ] Does the layout follow the project's primary structure convention?
   - [ ] Is information hierarchy communicated correctly (headings, weight, indentation)?
   - [ ] Is any detail hidden behind progressive disclosure? Does it follow the disclosure convention?
   - [ ] Is the density appropriate and consistent with the default?
   - [ ] Is a collection displayed? Does it use the correct display format (list / card grid / structured view)?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-presentation_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-language` — define language conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-presentation_behaviour.md` — conventions and agent checklist for presentation patterns.

## CLI Dependencies

None.

## Notes

- "Collection display" avoids the word "table" (flagged as an implementation term by the commithook). Use "structured view" for tabular presentation in specs and skill files.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
