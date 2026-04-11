# Skill: ux-adaptation

## Description

Elicit and capture adaptation UX conventions for the project: environment targets, layout reflow rules, dark/high-contrast support, constrained-environment fallbacks, and surface-capability handling. Writes `ux-adaptation_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-adaptation_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for adaptation patterns:
   - Responsive layout breakpoints or terminal-width detection
   - Dark mode or high-contrast mode handling
   - Environment detection: browser capabilities, terminal feature flags, device type
   - Constrained-environment fallbacks: low bandwidth, small screen, colour-limited terminal
   - Capability-dependent features: hover states, pointer precision, persistent storage

   Report what was found with source file references.

3. Ask targeted questions:

   > **Adaptation conventions — [surface type]**
   >
   > - What environments does the product run in? (desktop browser, mobile browser, native app, terminal)
   > - How does the layout change between environments or screen sizes? (reflow, collapsed view, dedicated layout)
   > - Does the product support dark mode or high-contrast mode? How is the preference detected and applied?
   > - How does the product behave in constrained environments? (small screen, keyboard-only, colour-limited, low bandwidth)
   > - What surface-specific capabilities are used, and how are they handled when absent? (hover, pointer, storage)

4. Draft `ux-adaptation_behaviour.md`:

   ```markdown
   ## Adaptation conventions

   ### Environment targets
   [Which surfaces and environments the product supports]

   ### Layout reflow
   [How layout changes across environments or screen sizes]

   ### Dark and high-contrast mode
   [How colour scheme preferences are detected and applied]

   ### Constrained environments
   [Fallback behaviour for limited screens, colour, or bandwidth]

   ### Capability handling
   [How surface-specific capabilities are used and what happens when absent]

   ## Agent checklist

   Before implementing any layout or environment-specific behaviour:
   - [ ] Does this implementation target all environments listed in the convention?
   - [ ] Does the layout reflow correctly across the defined breakpoints or terminal widths?
   - [ ] If dark or high-contrast mode is supported, is this feature affected by it?
   - [ ] Does this feature degrade gracefully in constrained environments?
   - [ ] Are any surface-specific capabilities used? Is the absence case handled?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-adaptation_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-consistency` — define consistency conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-adaptation_behaviour.md` — conventions and agent checklist for adaptation patterns.

## CLI Dependencies

None.

## Notes

- Reduced-motion handling is covered by `/tr-ux-accessibility` and cross-referenced here. Avoid duplicating the convention — reference the accessibility truth file instead.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
