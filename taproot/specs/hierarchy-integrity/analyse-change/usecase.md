# Behaviour: Analyse Change Impact

## Actor
Any taproot skill operating in refine/modify mode (`tr-ineed`, `tr-intent`, `tr-behaviour`, `tr-implement`, `tr-refine`, `tr-promote`) — or an AI coding agent acting directly on the hierarchy — when about to modify an existing artefact.

## Preconditions
- The target artefact exists in the hierarchy (`intent.md`, `usecase.md`, or `impl.md`)
- A proposed change has been described (in natural language or as a structured delta)
- The proposed change affects a goal, success criterion, constraint, actor, main flow step, or postcondition — not merely a status, date, or notes update
- No edits to the hierarchy have been made yet

## Main Flow
1. Caller provides the target path and a description of the proposed change.
2. Agent reads the target artefact and states which sections and fields it believes the change affects, then asks the caller to confirm before proceeding: "I interpret this change as affecting: [list of sections/fields]. Is that right?"
3. Agent walks the hierarchy from the target to find related artefacts, using three dependency types:
   - **Structural** — parent and child artefacts (intent → behaviours → implementations)
   - **Implementing** — `impl.md` files whose `## Behaviour` field references the changed `usecase.md`
   - **Conceptual** — artefacts sharing key terms from the changed sections (goals, actors, postconditions); flagged as "possibly affected — review recommended" rather than confirmed impact
4. Agent classifies each found artefact as:
   - **Direct** — the target being modified
   - **Downstream** — structural or implementing dependents
   - **Upstream** — parent artefacts whose success criteria or constraints may be affected
   - **Possibly affected** — conceptual matches requiring human review
5. Agent presents an impact summary to the caller:
   - Current state of the target (key fields being changed)
   - Proposed delta (what changes)
   - Confirmed downstream and upstream artefacts
   - Possibly-affected artefacts flagged separately
6. Caller (human or orchestrating skill) confirms the scope. If the caller does not confirm, they may:
   - **Cancel** — operation stops, no edits are made
   - **Narrow** — caller revises the proposed delta; behaviour returns to Step 1 with the revised change

## Alternate Flows
### No cascading impact
- **Trigger:** The proposed change affects only the target artefact — no downstream, upstream, or conceptual matches found.
- **Steps:**
  1. Agent reports: "This change is self-contained — no other artefacts are affected."
  2. Caller proceeds directly to editing.

### Large blast radius
- **Trigger:** The impact list is large enough that the caller requests grouping and explicit confirmation before proceeding.
- **Steps:**
  1. Agent presents the full impact list grouped by type (intents, behaviours, implementations, possibly-affected).
  2. Agent asks: "This change touches a large number of artefacts. Proceed with full scope, or narrow the change first?"
  3. Caller confirms or adjusts the proposed change before proceeding.

### Change is actually an addition
- **Trigger:** The target path does not exist — this is a new artefact, not a modification.
- **Steps:**
  1. Agent flags: "This looks like a new addition rather than a change to an existing artefact."
  2. Caller is redirected to `/tr-ineed` or the appropriate creation skill.

## Postconditions
- The caller has a clear picture of what will change and what else requires review or update.
- No hierarchy artefacts have been modified.
- The confirmed impact list remains in the active agent session context for use by the downstream editing skill. For multi-session use, the caller may request the list be written to `.taproot/change-analysis.md`.

## Error Conditions
- **Target path not found**: Agent reports the path does not exist and stops. Suggests `/tr-ineed` if the intent was to add something new.
- **Proposed change is too vague to analyse**: Agent asks for a more specific description of what is changing before proceeding.
- **Uncertain dependency**: Agent cannot confidently determine whether an artefact is affected. Flags it as "possibly affected — review recommended" rather than forcing inclusion or exclusion.

## Acceptance Criteria

**AC-1: Impact summary presented before any edit**
- Given an existing hierarchy artefact and a proposed change description
- When `/tr-analyse-change` is invoked
- Then the agent presents an impact summary (direct, downstream, upstream, possibly-affected) and waits for caller confirmation before any edits are made

**AC-2: Self-contained change is identified**
- Given a proposed change that affects only the target artefact with no structural or conceptual dependents
- When the agent walks the hierarchy
- Then the agent reports "This change is self-contained — no other artefacts are affected"

**AC-3: Large blast radius triggers explicit confirmation**
- Given a proposed change that affects a large number of artefacts
- When the impact list is presented
- Then the agent asks the caller to confirm the full scope or narrow the change before proceeding

**AC-4: New artefact redirected to creation skill**
- Given a target path that does not exist in the hierarchy
- When `/tr-analyse-change` is invoked
- Then the agent flags this as an addition (not a modification) and redirects to `/tr-ineed`

**AC-5: Cancel stops all edits**
- Given a caller who cancels after reviewing the impact summary
- When the caller chooses Cancel
- Then no hierarchy artefacts are modified

## Implementations <!-- taproot-managed -->
- [Agent Skill — /tr-analyse-change](./agent-skill/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- This behaviour is intentionally read-only — it produces an impact report, it does not apply changes.
- A changelog (recording what changed, when, and why) and automated cascading-update propagation are explicitly deferred to a future behaviour.
- Skills that modify existing artefacts (`tr-intent` in refine mode, `tr-refine`, `tr-promote`) should call this behaviour first when the change scope is non-trivial.
- **Intent scope note:** The parent intent (`hierarchy-integrity`) currently focuses on reactive validation. This behaviour extends it into prospective safety — preventing integrity problems before they occur. If this distinction grows into a broader change-management concern, a dedicated intent should be considered.
- **Concurrent invocations:** This behaviour provides no locking mechanism. Two agents analysing the same target simultaneously may both confirm and proceed to make conflicting edits. Callers in parallel agent pipelines must coordinate externally.
