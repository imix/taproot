# Behaviour: Analyse Change Impact

## Actor
Any skill or agent proposing a modification to an existing hierarchy artefact (intent, behaviour, or implementation) — invoked by `tr-ineed`, `tr-intent`, `tr-behaviour`, or `tr-implement` before any edits are made.

## Preconditions
- The target artefact exists in the hierarchy (`intent.md`, `usecase.md`, or `impl.md`)
- A proposed change has been described (in natural language or as a structured delta)
- No edits to the hierarchy have been made yet

## Main Flow
1. Caller provides the target path and a description of the proposed change.
2. Agent reads the target artefact and identifies which sections and fields the change affects.
3. Agent walks the hierarchy downward (intent → behaviours → implementations) and upward (impl → behaviour → intent) from the target to find artefacts that depend on the changed elements.
4. Agent classifies each affected artefact as:
   - **Direct** — the target being modified
   - **Downstream** — artefacts that reference or implement the changed content
   - **Upstream** — parent artefacts whose success criteria or constraints may be affected
5. Agent presents an impact summary to the caller:
   - Current state of the target (key fields being changed)
   - Proposed delta (what changes)
   - List of downstream and upstream artefacts that will need review or update
6. Caller (human or orchestrating skill) confirms the scope before any edits proceed.

## Alternate Flows
### No cascading impact
- **Trigger:** The proposed change affects only the target artefact — no downstream or upstream artefacts reference the changed content.
- **Steps:**
  1. Agent reports: "This change is self-contained — no other artefacts are affected."
  2. Caller proceeds directly to editing.

### Large blast radius
- **Trigger:** More than five artefacts are affected.
- **Steps:**
  1. Agent presents the full impact list grouped by type (intents, behaviours, implementations).
  2. Agent asks: "This change touches N artefacts. Proceed with full scope, or narrow the change first?"
  3. Caller confirms or adjusts the proposed change before proceeding.

### Change is actually an addition
- **Trigger:** The target path does not exist — this is a new artefact, not a modification.
- **Steps:**
  1. Agent flags: "This looks like a new addition rather than a change to an existing artefact."
  2. Caller is redirected to `/tr-ineed` or the appropriate creation skill.

## Postconditions
- The caller has a clear picture of what will change and what else requires review or update.
- No hierarchy artefacts have been modified.
- The confirmed impact list is available as context for the downstream editing skill.

## Error Conditions
- **Target path not found**: Agent reports the path does not exist and stops. Suggests `/tr-ineed` if the intent was to add something new.
- **Proposed change is too vague to analyse**: Agent asks for a more specific description of what is changing before proceeding.

## Status
- **State:** proposed
- **Created:** 2026-03-19

## Notes
- This behaviour is intentionally read-only — it produces an impact report, it does not apply changes.
- A changelog (recording what changed, when, and why) and automated cascading-update propagation are explicitly deferred to a future behaviour.
- Skills that modify existing artefacts (`tr-intent` in refine mode, `tr-refine`, `tr-promote`) should call this behaviour first when the change scope is non-trivial.
