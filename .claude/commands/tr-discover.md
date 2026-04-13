---
name: 'tr-discover'
description: 'Reverse-engineer an existing project into a taproot hierarchy — from source code, existing requirements artifacts (PRDs, stories, ADRs), or both'
---

<!-- taproot:cli-invocation: node dist/cli.js -->
**CLI:** All taproot commands in this skill must use `node dist/cli.js` instead of bare `taproot`.

<!-- taproot:capabilities -->
**Capabilities:** When a skill step contains `[invoke: compress-context]`, run `/compact`. For any other `[invoke: X]`, show "ℹ️ Capability `X` is not available in this agent — continuing." and proceed to the next step.

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY:

<steps CRITICAL="TRUE">
1. LOAD the FULL skill file at @{project-root}/taproot/agent/skills/discover.md
2. READ its entire contents — this contains the complete skill definition with steps, inputs, and output format
3. FOLLOW every step in the ## Steps section precisely and in order
4. When the skill references other taproot commands (e.g. `/taproot:intent`), use the corresponding `/tr-intent` command instead
5. Save all outputs to the paths specified in the skill's ## Output section
6. When the skill says to run `taproot <cmd>`, run `node dist/cli.js <cmd>` instead
7. Run `node dist/cli.js overview` to update @{project-root}/taproot/OVERVIEW.md with the current project state
</steps>
