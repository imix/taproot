# Skill: ux-orientation

## Description

Elicit and capture orientation UX conventions for the project: how users discover where they are, what empty states look like, how onboarding works, and where help is surfaced. Writes `ux-orientation_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-orientation_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for orientation patterns:
   - Empty-state components or messages (no data, no results, first-run screens)
   - Breadcrumb, title, or header patterns indicating current location
   - Onboarding flows, welcome screens, or first-run tutorials
   - Help links, tooltips, or inline guidance placements
   - Dead-end handling (no results, permission-denied, 404-equivalent)

   Report what was found with source file references.

3. Ask targeted questions. Collapse into a single prompt when surface type is already known:

   > **Orientation conventions — [surface type]**
   >
   > Answer each that applies; skip any that don't:
   >
   > - How does the user know where they are? (breadcrumbs, page title, active indicator, prompt prefix)
   > - What does an empty state look like — no data, no results, first run? (message text style, actions offered)
   > - How is a new user oriented on first arrival vs a returning user?
   > - Where and how is help or guidance surfaced? (inline, sidebar, tooltip, `--help`, `?` command)
   > - How are dead ends communicated? (no results, permission denied, missing resource)

   If `surface` was not provided, prepend: "What surface type? (cli / web / mobile / desktop)"

4. Review discovered patterns against answers. Note any gaps or contradictions.

5. Draft the `ux-orientation_behaviour.md` content:

   ```markdown
   ## Orientation conventions

   ### Context indicators
   [How the user knows where they are]

   ### Empty states
   [What empty/no-result/first-run states look like]

   ### Onboarding
   [How new vs returning users are oriented]

   ### Help and guidance
   [Where and how help is surfaced]

   ### Dead ends
   [How the system handles no results, denied access, missing items]

   ## Agent checklist

   Before implementing any screen, view, or command:
   - [ ] Does this view/command have an empty state? Does it follow the empty-state convention?
   - [ ] Does this view tell the user where they are? (breadcrumb, title, prompt)
   - [ ] Is help discoverable from this view? Does its placement follow the help-placement convention?
   - [ ] If access is denied or the resource is missing, is the response actor-visible and actionable?
   ```

6. If `ux-orientation_behaviour.md` already exists:

   > **[artifact-review]** Draft conventions ready — existing file found.
   > **[A]** Extend — append new conventions  **[B]** Replace — overwrite  **[C]** Cancel

   If no existing file:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write `ux-orientation_behaviour.md`  **[C]** Cancel

7. On **[A]**: write `taproot/global-truths/ux-orientation_behaviour.md`. Report: "✓ Written: `taproot/global-truths/ux-orientation_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-flow` — define flow conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-orientation_behaviour.md` — conventions and agent checklist for orientation patterns.

## CLI Dependencies

None.

## Notes

- Surface-agnostic questions: "breadcrumbs" = web/desktop; "prompt prefix" = CLI; "title bar" = desktop/mobile. Adapt the checklist language to the confirmed surface type.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
