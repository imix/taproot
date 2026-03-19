---
name: 'tr-trace'
description: 'Navigate the requirement hierarchy in any direction: from code to intent (bottom-up), from intent to code (top-down), laterally across siblings, or scan for unlinked code'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY:

<steps CRITICAL="TRUE">
1. LOAD the FULL skill file at @{project-root}/.taproot/skills/trace.md
2. READ its entire contents — this contains the complete skill definition with steps, inputs, and output format
3. FOLLOW every step in the ## Steps section precisely and in order
4. When the skill references other taproot commands (e.g. `/taproot:intent`), use the corresponding `/tr-intent` command instead
5. Save all outputs to the paths specified in the skill's ## Output section
6. Run `taproot overview` to update @{project-root}/taproot/OVERVIEW.md with the current project state
</steps>
