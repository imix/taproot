# Skill: refine

## Description

Update a behaviour spec (`usecase.md`) based on what was learned during or after implementation. Implementations frequently reveal that specs were incomplete, ambiguous, or wrong — this skill brings the spec back into alignment with reality (or reality into alignment with the spec).

## Inputs

- `path` (required): Path to the behaviour folder containing the `usecase.md` to refine.
- `finding` (required): Description of what changed or was discovered. Can be free-form.

## Steps

1. Read `<path>/usecase.md`. Read all `impl.md` files under `<path>/` to understand the current implementation state.

2. Classify the finding into one or more categories:
   - **Missing flow**: a scenario that happens in reality but isn't in the spec (add alternate flow or error condition)
   - **Incorrect flow**: a step in the spec that doesn't match how the system actually behaves (correct it)
   - **Missing postcondition**: something that is now true after the behaviour that wasn't listed
   - **New constraint**: a limit discovered during implementation (rate limit, quota, timeout) that should be in the spec
   - **Scope change**: the behaviour is actually larger or smaller than originally specified
   - **Actor change**: the actor is different from what was specified, or multiple actors are involved
   - **State machine issue**: the preconditions or postconditions interact with other behaviours in ways not reflected

3. Draft the changes to `usecase.md`. Show the diff to the user: "Here's what I'm changing: [before/after for each section]." Ask for confirmation before writing.

4. Update the `usecase.md`:
   - For missing flows: add to Alternate Flows or Error Conditions
   - For incorrect flows: correct the Main Flow steps or affected sections
   - For new constraints: add to Preconditions or Error Conditions
   - Update "Last reviewed" to today
   - If the finding is significant enough to change the state, update Status
   - **Preserve the `## Implementations <!-- taproot-managed -->` section exactly** — read and re-insert it unchanged before `## Status` after applying other edits. Never discard it during a rewrite.
   - **Preserve `## Acceptance Criteria` IDs** — you may update the Given/When/Then wording, but never change an existing AC-N ID. If a new flow is added, assign the next available ID (highest existing + 1). If a criterion is retired, mark it `~~AC-N: deprecated~~` rather than removing it.

5. Run `taproot sync-check --path <taproot-root>`. If any `impl.md` files under this behaviour are flagged as `SPEC_UPDATED`, list them explicitly: "These implementations may need to be reviewed against the updated spec: [list]."

6. Check if the change cascades upward: does the finding imply that the parent intent's goal, success criteria, or constraints are wrong or incomplete? If yes: "This finding may affect the parent intent at `<intent-path>`. Consider running `/taproot:promote` to update the intent and flag any other behaviours that may be affected."

7. Run `taproot validate-format --path <path>`.

8. Report what changed.

## Output

An updated `usecase.md` reflecting the new understanding. A list of any downstream effects (impl.md files that may need review, intent-level implications).

## CLI Dependencies

- `taproot sync-check`
- `taproot validate-format`

## Notes

- If the finding is so significant that the behaviour needs to be split into two, suggest that explicitly and offer to run `/taproot:behaviour` to create the new one, then `/taproot:decompose` to restructure.
- Never silently remove steps or error conditions that may still be relevant. When in doubt, ask the user whether the old spec was wrong or whether the implementation is wrong.
- If the implementation diverged from the spec and both are acceptable, clarify with the user which is the "true" state and update accordingly.
