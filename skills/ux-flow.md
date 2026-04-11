# Skill: ux-flow

## Description

Elicit and capture flow UX conventions for the project: navigation model, multi-step task sequences, cancellation behaviour, and destructive-action confirmation gates. Writes `ux-flow_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-flow_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for flow patterns:
   - Navigation structures: menus, tabs, wizard steps, command routing
   - Multi-step tasks: step indicators, progress bars, breadcrumb trails
   - Cancellation paths and back/forward behaviour
   - Confirmation prompts before destructive or irreversible actions
   - Handling of unexpected navigation (unsaved changes, mid-flow exits)

   Report what was found with source file references.

3. Ask targeted questions:

   > **Flow conventions — [surface type]**
   >
   > - How does the user move between areas or steps? (menus, tabs, wizard steps, `cd`, subcommands)
   > - What happens when the user cancels mid-task — is progress preserved or discarded?
   > - How are multi-step tasks signposted? (step count, progress indicator, can the user jump back?)
   > - When does the system ask for confirmation before a destructive or irreversible action?
   > - How does the system handle unexpected exit? (unsaved changes warning, partial state preserved)

4. Draft `ux-flow_behaviour.md`:

   ```markdown
   ## Flow conventions

   ### Navigation model
   [How the user moves between areas/steps]

   ### Multi-step tasks
   [How multi-step sequences are signposted and navigated]

   ### Cancellation
   [What happens on cancel — progress preserved or discarded]

   ### Destructive-action confirmation
   [When and how the system asks for confirmation before irreversible actions]

   ### Unexpected exit
   [How mid-flow abandonment is handled]

   ## Agent checklist

   Before implementing any navigation, wizard, or destructive action:
   - [ ] Does this action follow the project's navigation model?
   - [ ] If multi-step, is the step count and current position communicated?
   - [ ] Is there a cancel path? Does it follow the preservation/discard convention?
   - [ ] Is this action destructive or irreversible? Is confirmation required by convention?
   - [ ] If the user exits unexpectedly, is state handled correctly?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-flow_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-feedback` — define feedback conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-flow_behaviour.md` — conventions and agent checklist for flow patterns.

## CLI Dependencies

None.

## Notes

- "Destructive action" = delete, overwrite, irreversible send. "Destructive" is actor-visible — avoid terms like "idempotent" or "side-effect-free" in the truth file.
- If invoked from `/tr-ux-define`, skip the What's next block and return control to the orchestrator.
