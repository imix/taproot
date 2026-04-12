# Skill: ux-visual

## Description

Elicit and capture visual language conventions for the project: colour palette, semantic colour tokens, dark/light mode rules, icon set selection, iconography style, and sizing conventions. Writes `ux-visual_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. If omitted, the skill asks.

## Steps

1. Scan `taproot/global-truths/` for an existing `ux-visual_behaviour.md`. If found, read it and note current conventions.

2. Scan the codebase for visual language patterns:
   - Colour variable declarations: CSS custom properties (`--color-*`), design token files, Tailwind config colour scales
   - Icon imports or references: import statements from icon libraries, SVG sprite references, icon component usage
   - Design token files: `tokens.json`, `design-tokens.ts`, `theme.ts`, or equivalent

   Report what was found with source file references. If two or more incompatible colour definitions are found for the same token, surface the conflict with source references and ask the developer to declare which usage is canonical before proceeding.

3. Ask targeted questions:

   > **Visual language conventions — [surface type]**
   >
   > **Colour palette**
   > - What are the brand, neutral-scale, and accent colours? (hex, rgb, or hsl values)
   > - What are the canonical token names for these colours? (CSS custom properties, JS/TS design token keys, or Tailwind config names — define them now if not yet established)
   > - How are semantic colours defined? (error, warning, success, info, disabled states — names and values)
   > - Does the project support dark mode, light mode, or both? If both, how do colour tokens adapt between modes?
   >
   > **Iconography**
   > - What icon set or library is the project using? (e.g. Heroicons, Lucide, Material Icons, Phosphor, custom SVGs)
   > - What iconography style is preferred? (outlined, filled, duotone, rounded, sharp)
   > - How is icon sizing determined? (fixed scale such as 16/20/24 px, context-dependent, or responsive)
   > - Are there colour or icon conventions that differ by surface? (e.g. CLI uses Unicode symbols, web uses SVG icons)

4. Draft `ux-visual_behaviour.md`:

   ```markdown
   ## Visual language conventions

   ### Colour palette

   #### Brand, neutral, and accent colours
   [Token names and values]

   #### Semantic colours
   [Error, warning, success, info, disabled — names and values]

   #### Dark/light mode
   [Supported modes and token adaptation rules, or TODO if deferred]

   ### Iconography

   #### Icon set
   [Library name, version if pinned, import path convention]

   #### Style and sizing
   [Preferred style (outlined/filled/etc.) and sizing scale]

   #### Surface-specific icon conventions
   [Any per-surface differences, or "none — consistent across surfaces"]

   ## Agent checklist

   Before implementing any view, screen, or output format:
   - [ ] Are all colours referenced by their canonical token names (not raw hex values)?
   - [ ] Do semantic colours (error, warning, success, info) use the project's defined tokens?
   - [ ] If the surface supports dark mode, are colour tokens mode-aware?
   - [ ] Are icons sourced from the project's designated icon set?
   - [ ] Do icon sizes follow the project's sizing scale?
   - [ ] Are surface-specific icon conventions applied (e.g. Unicode symbols in CLI output)?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)  **[B]** Replace existing  **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/ux-visual_behaviour.md`. Report path written.

7. Offer a codebase sweep:

   > Sweep the codebase for code that may not conform to these visual conventions?
   > **[A]** Yes, run `/tr-sweep`  **[S]** Skip

   On **[A]**: invoke `/tr-sweep` with the newly written truth file as context.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-ux-consistency` — define consistency conventions
> [2] `/tr-ux-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/ux-visual_behaviour.md` — conventions and agent checklist for visual language.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-ux-define`, suppress the What's next block and return control to the orchestrator.
- The sweep offer (step 7) satisfies the parent intent success criterion: after any sub-skill writes a truth file, the developer is offered a sweep.
- Token names, not hex values, are the primary deliverable. If a developer cannot provide token names yet, record the hex values with a `TODO: assign token names` marker so the truth file remains useful while signalling the gap.
- Partial completion is supported: if the developer can confirm colour conventions but not icon set (or vice versa), write the confirmed domain with a `TODO` placeholder for the deferred domain. The sub-skill can be re-invoked to complete it.
