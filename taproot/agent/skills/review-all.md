# Skill: review-all

## Description

Run a comprehensive review of an entire subtree — an intent and all its descendants, or the entire `taproot/` root. Applies the per-artifact review logic from `/taproot:review` to each node, then adds cross-cutting analysis that can only be done by comparing artifacts against each other. Produces a consolidated report.

## Inputs

- `path` (optional): Path to an intent folder or the `taproot/` root. Defaults to `taproot/`.

## Steps

1. Run `taproot validate-structure --path <path>` and `taproot validate-format --path <path>`. Include any validation errors in the report as **Structural Issues** (resolve these before addressing semantic issues — a structurally invalid hierarchy produces unreliable analysis).

2. Run `taproot check-orphans --path <path> --include-unimplemented`. Include results in the report as **Orphan & Coverage Issues**.

3. Run `taproot sync-check --path <path>`. Include results in the report as **Staleness Warnings**.

4. Walk the subtree top-down. For each artifact found:
   - Read the file
   - Apply the review logic from `/taproot:review` (Steps 3 of that skill)
   - Record findings tagged with the artifact path

5. After reviewing all individual artifacts, perform **cross-cutting analysis**:

   **Intent ↔ Behaviours:**
   - For each intent, check every success criterion against the list of behaviours. Is there at least one behaviour that, if implemented, would contribute to satisfying each criterion? Flag criteria with no corresponding behaviour as **Coverage Gaps**.
   - Are there behaviours that don't obviously serve any success criterion? Flag as **Potentially Gold-Plated**.
   - Do sibling behaviours have contradictory postconditions? (e.g., behaviour A sets a flag, behaviour B assumes that flag is unset)

   **Behaviours ↔ Implementations:**
   - For each behaviour, check whether its main flow steps are traceable to at least one implementation. Steps with no implementation are **Unimplemented Flows**.
   - Do implementations reference source files that have been modified more recently than the spec was last reviewed? (Cross-reference with `taproot sync-check` output.)

   **Across the hierarchy:**
   - Are there behaviours that are nearly identical across different intents? Possible duplication.
   - Are there intents at similar levels of completion, where one could be sequenced to unblock the other?

6. Assemble the consolidated report:

```
# Taproot Review: <path>

## Structural Issues
<from validate-structure and validate-format>

## Orphan & Coverage Issues
<from check-orphans>

## Staleness Warnings
<from sync-check>

## Cross-Cutting Issues
### Coverage Gaps
### Contradictions
### Duplication

## Per-Artifact Findings

### <artifact-path>
**Blockers**: ...
**Concerns**: ...
**Suggestions**: ...

```

7. Close with a prioritized action list: "Recommended next steps: (1) resolve structural issues, (2) address blockers in [artifact], (3) fill coverage gaps for [criterion]."

8. **Truth discovery pass** — if `taproot/global-truths/` exists and the hierarchy has 3 or more readable `intent.md`/`usecase.md` files (excluding `global-truths/`):

   Run the same scan as `/tr-discover-truths` (Phase 2–3 of that skill): collect candidates not already defined in `global-truths/` and not suppressed by `taproot/backlog.md` dismissed entries.

   If candidates are found, append to the report:

   ```
   ## Truth Candidates

   The following implicit facts were detected in the hierarchy but are not yet captured as global truths:

   - `<term>` (scope: <intent|behaviour|impl>) — found in: <spec-path>, <spec-path>
   ...
   ```

   Then offer:
   > "[P] Process candidates now via `/tr-discover-truths`  [D] Defer — append all to backlog"

   **If [P]:** invoke `/tr-discover-truths` inline; return here when it completes.

   **If [D]:** append each candidate to `taproot/backlog.md` as `- [YYYY-MM-DD] truth candidate: <term>`.

   If no candidates found (hierarchy consistent with existing truths), append to report:
   ```
   ## Truth Candidates
   No new candidates — hierarchy is consistent with existing global truths.
   ```

9. Present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-refine <highest-priority-path>` — fix the top-priority finding
   [B] `/tr-next` — surface the next implementable behaviour
   [C] `/tr-backlog <finding>` — capture a deferred finding before routing it to the hierarchy

## Output

A consolidated review report covering the entire subtree, with structural issues, cross-cutting analysis, and per-artifact findings.

## CLI Dependencies

- `taproot validate-structure`
- `taproot validate-format`
- `taproot check-orphans`
- `taproot sync-check`

## Notes

- For large hierarchies (>20 artifacts), batch the per-artifact review by intent to avoid overwhelming the user. Present one intent at a time and ask if they want to continue.
- If the user wants to act on findings immediately, each finding can link to the skill that fixes it: `/taproot:refine` for behaviour and impl issues, `/taproot:intent` for intent issues, `/taproot:implement` for unimplemented flows.
