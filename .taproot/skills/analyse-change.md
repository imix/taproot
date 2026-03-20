# Skill: analyse-change

## Description

Analyse the impact of a proposed change to an existing hierarchy artefact before any edits are made. Identifies what is currently in place, which sections the change affects, and what downstream and upstream artefacts will need review. Produces an impact report and gates on caller confirmation. Read-only — never modifies the hierarchy.

## Inputs

- `path` (required): Path to the existing artefact being changed (`intent.md`, `usecase.md`, or `impl.md`).
- `change` (required): Natural language description of the proposed change.

## Steps

1. **Verify the target exists.** If the path does not exist, report: "No artefact found at `<path>`. If you're adding something new, use `/tr-ineed` instead." Then stop.

2. **Read the target artefact.** Identify its type (intent / behaviour / implementation) by filename.

3. **Confirm interpretation.** State which sections and fields you believe the change affects:
   > "I interpret this change as affecting: [list of sections — e.g., Goal, Success Criteria, Main Flow step 3]. Is that right?"

   Wait for confirmation. If the caller corrects the interpretation, update your understanding and re-confirm before continuing.

4. **Check scope.** If the change only affects status, dates, or notes fields — report: "This is a minor update (status/date/notes only) — no impact analysis needed." Then stop.

5. **Build the hierarchy map.** Run `taproot coverage --format json` and parse the output to get the full intent → behaviour → implementation tree.

6. **Walk for dependencies** using three methods:

   **Structural** (definitive):
   - If target is an `intent.md`: all behaviours and their implementations are downstream
   - If target is a `usecase.md`: its parent intent is upstream; all its `impl.md` files are downstream
   - If target is an `impl.md`: its parent `usecase.md` and grandparent `intent.md` are upstream

   **Implementing** (definitive):
   - Scan all `impl.md` files in the hierarchy for a `## Behaviour` field referencing the changed `usecase.md`
   - These are direct implementing dependents

   **Conceptual** (advisory — agent reasoning):
   - Identify 3–5 key terms from the changed sections (actor names, capability phrases, postcondition states)
   - Scan other `intent.md` and `usecase.md` files for these terms
   - Flag matches as "possibly affected — review recommended", not confirmed impact

7. **Classify every found artefact:**
   - **Direct** — the target itself
   - **Downstream** — structural children or implementing impls
   - **Upstream** — structural parents
   - **Possibly affected** — conceptual matches

8. **Present the impact summary:**

   ```
   ## Change Impact Report
   Target: <path>
   Change: <summary of proposed delta>

   ### Current State
   <key fields being changed, quoted from the artefact>

   ### Proposed Delta
   <what changes>

   ### Confirmed Impact
   Downstream:
   - taproot/<path> [behaviour/impl — reason]
   Upstream:
   - taproot/<path> [intent — reason]

   ### Possibly Affected (review recommended)
   - taproot/<path> — shares term "<term>" in <section>

   ### Next Step
   [A] Proceed with full scope   [N] Narrow the change   [C] Cancel
   ```

9. **Gate on confirmation:**
   - **[A] Proceed**: return the impact report as context and indicate the caller may now make edits. Then:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

     **What's next?**
     [A1] `/tr-refine <path>` — apply the change to the behaviour spec
     [A2] `/tr-intent <path>` — revise the intent if upstream is affected

   - **[N] Narrow**: ask "What would you like to change about the proposed delta?" then return to Step 3 with the revised description
   - **[C] Cancel**: report "No changes made." and stop

## Output

An impact report presented in the conversation, followed by a confirmed go/no-go for the calling skill to proceed with edits. No files are written unless the caller explicitly requests the report saved to `.taproot/change-analysis.md`.

## CLI Dependencies

- `taproot coverage`

## Notes

- This skill is read-only. It reports impact; it does not apply changes.
- Conceptual matching (Step 6) is agent reasoning, not a deterministic algorithm — it may miss indirect dependencies or flag false positives. Treat "possibly affected" as a prompt for human review, not a definitive list.
- This skill is typically called by other skills (`tr-intent` in refine mode, `tr-refine`, `tr-promote`, `tr-ineed` when detecting a change) rather than directly by the user. Direct invocation is also valid.
- Concurrent invocations are not protected by any locking mechanism. In parallel agent pipelines, external coordination is required.
- `/tr-analyse-change` is the Claude Code adapter command name for this skill.
