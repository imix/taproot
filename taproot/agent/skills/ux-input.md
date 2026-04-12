# Skill: ux-input

## Description

Elicit and capture input UX conventions for the project: validation timing, required/optional signalling, default values, keyboard affordances, and destructive-input confirmation. Writes `ux-input_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-input_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for input patterns:
   - Form layouts, label positioning, placeholder text usage
   - Validation: when it triggers, where errors appear
   - Required vs optional field signalling
   - Default values and pre-populated fields
   - Keyboard shortcuts and their discoverability
   - Destructive input patterns (delete, clear, overwrite)

   Report what was found with source file references.

3. Ask targeted questions:

   > **Input conventions — [surface type]**
   >
   > - When is validation shown — on blur, on submit, or as the user types?
   > - How are required vs optional fields distinguished?
   > - What are the defaults for inputs — explicit values, empty, or placeholder-only?
   > - How are keyboard shortcuts documented and discoverable? (tooltip, `?` command, legend)
   > - How does the system handle destructive inputs? (delete, clear, overwrite — confirmation required?)
   > - How are complex inputs handled? (file upload, date picker, multi-select, rich text)

4. Draft `ux-input_behaviour.md`:

   ```markdown
   ## Input conventions

   ### Validation
   [When validation fires and where errors appear]

   ### Required and optional fields
   [How required vs optional is distinguished]

   ### Defaults
   [Default values and pre-population behaviour]

   ### Keyboard affordances
   [Keyboard shortcuts and how they are made discoverable]

   ### Destructive inputs
   [How delete, clear, and overwrite actions are handled]

   ### Complex inputs
   [Conventions for file upload, date selection, multi-select, etc.]

   ## Agent checklist

   Before implementing any input field or form:
   - [ ] Does validation follow the project timing convention (blur / submit / as-you-type)?
   - [ ] Is the required/optional state communicated correctly?
   - [ ] Does this input have a sensible default or pre-populated value?
   - [ ] If destructive, is confirmation required by convention?
   - [ ] Are keyboard shortcuts discoverable?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-input_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-presentation` — define presentation conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-input_behaviour.md` — conventions and agent checklist for input patterns.

## CLI Dependencies

None.

## Notes

- Keyboard affordances overlap with `/tr-ux-accessibility`. If accessibility conventions exist, cross-reference rather than duplicating keyboard navigation rules.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
