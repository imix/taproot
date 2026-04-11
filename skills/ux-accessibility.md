# Skill: ux-accessibility

## Description

Elicit and capture accessibility UX conventions for the project: keyboard model, focus management, contrast targets, motion preferences, labelling, and live region announcements. Writes `ux-accessibility_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-accessibility_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for accessibility patterns:
   - Keyboard navigation: tab order, arrow-key patterns, shortcut keys
   - Focus management: where focus goes after modal open/close, drawer, dynamic content
   - ARIA roles, labels, and descriptions
   - Colour contrast conventions
   - Motion and animation: reduced-motion media query usage
   - Screen-reader announcements: live regions, status messages

   Report what was found with source file references.

3. Ask targeted questions:

   > **Accessibility conventions — [surface type]**
   >
   > - What keyboard navigation model is used? (tab order, arrow-key within components, global shortcuts)
   > - How is focus managed when content changes dynamically? (modal, drawer, inline expansion)
   > - What contrast level is the target? (for body text, UI controls, and decorative elements separately)
   > - How are motion and animation handled for users who prefer reduced motion?
   > - How are meaningful images and icons labelled for assistive technology?
   > - What surfaces require live region announcements? (status updates, async results, form errors)

4. Draft `ux-accessibility_behaviour.md`:

   ```markdown
   ## Accessibility conventions

   ### Keyboard model
   [Tab order, arrow-key navigation, global shortcuts and their discoverability]

   ### Focus management
   [Where focus moves after dynamic content changes]

   ### Contrast
   [Target contrast levels for text, controls, and decorative elements]

   ### Motion and animation
   [Reduced-motion handling]

   ### Labelling
   [How images, icons, and interactive controls are labelled for assistive technology]

   ### Live regions
   [Which surfaces use live region announcements and what they announce]

   ## Agent checklist

   Before implementing any interactive component or dynamic update:
   - [ ] Is this component keyboard-navigable following the project's keyboard model?
   - [ ] If this action changes content dynamically, is focus managed correctly?
   - [ ] Do all images and icons have appropriate labels?
   - [ ] Does this component meet the project's contrast target?
   - [ ] If this component uses motion, is reduced-motion handled?
   - [ ] If this action produces an async result or status change, is a live region announcement needed?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-accessibility_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-adaptation` — define adaptation conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-accessibility_behaviour.md` — conventions and agent checklist for accessibility patterns.

## CLI Dependencies

None.

## Notes

- For CLI surfaces, accessibility means: no colour-only information, readable without ANSI formatting (plain-text fallback), keyboard-only operation is the default (not an add-on).
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
