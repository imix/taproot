# Skill: plan

## Description

Surface the next independently-implementable work item from the requirement hierarchy. Runs `taproot plan` to scan and classify candidates as AFK (agent can proceed autonomously) or HITL (human input required), presents the recommended next slice, and delegates to `/tr-implement` once the developer confirms.

## Inputs

- `path` (optional): Behaviour path to implement directly — skips discovery and goes straight to `/tr-implement`.

## Steps

1. **If a path was provided**: skip to Step 5 and invoke `/tr-implement <path>` directly.

2. Run `taproot plan` and read the output. It lists:
   - **AFK** candidates: behaviours with `specified` state, ready to implement autonomously
   - **HITL** candidates: behaviours with `proposed` state, needing human review first
   - **In-progress** implementations: partially-implemented behaviours that can be resumed

3. If no candidates are found (all behaviours fully implemented), report: "Everything is implemented."

   Nothing obvious next — whenever you're ready:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-review-all` — semantic review of the full hierarchy
   [B] `/tr-ineed` — capture a new requirement

   Then stop.

4. Recommend the top AFK candidate (first in the sorted output). Present it as:
   > "Next recommended slice: **`<behaviour-path>`** (`<intent goal>`)"
   > "Classification: AFK — spec is complete, no design decisions required."
   > "To implement: `/tr-implement taproot/<behaviour-path>/`"
   >
   > **[Y]** Implement this   **[L]** Show full list   **[S]** Skip to a different behaviour

   - **[Y]**: proceed to Step 5
   - **[L]**: display the full `taproot plan` output, then ask the developer to pick a behaviour path, then proceed to Step 5
   - **[S]**: ask "Which behaviour path would you like to implement?" then proceed to Step 5

5. If the top candidate is HITL (no AFK candidates exist), flag it:
   > "The next unimplemented behaviour is HITL — the spec needs clarification before an agent can proceed autonomously."
   > "Behaviour: `<path>`"

   **Next:** `/tr-refine taproot/<path>/` — sharpen the spec, then return here

6. Invoke `/tr-implement taproot/<behaviour-path>/` with the confirmed path.

## Output

Delegates to `/tr-implement`. No files are written directly by this skill.

## CLI Dependencies

- `taproot plan`

## Notes

- AFK/HITL classification is determined by the `taproot plan` command using the behaviour's `usecase.md` state as a proxy: `specified` → AFK, `proposed` → HITL.
- This skill is the conversational wrapper around `taproot plan` — it adds selection, confirmation, and delegation logic that the CLI command cannot provide.
- `/tr-next` is the Claude Code adapter command name for this skill.
