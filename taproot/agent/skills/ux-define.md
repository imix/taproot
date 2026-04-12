# Skill: ux-define

## Description

Activate the user-experience quality module: scan for existing UX coverage, walk through each of the 10 UX aspects, elicit conventions via sub-skills, and optionally wire a DoD condition so agents apply UX conventions automatically. Run once to bootstrap the module; re-run at any time to extend or revisit aspects.

## Inputs

- `aspects` (optional): Comma-separated subset of aspects to run — `orientation`, `flow`, `feedback`, `input`, `presentation`, `language`, `accessibility`, `adaptation`, `consistency`, `visual`. Defaults to all 10.
- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. Passed to each sub-skill. If omitted, the first sub-skill asks; the answer is reused for all subsequent sub-skills.

## Steps

### Phase 0 — Establish project context

1. Read `taproot/global-truths/project-context_intent.md` if it exists.

   **If the record exists:**

   > **Project context found**
   >
   > Product type: [value]   Target audience: [value]   Quality goals: [value]
   >
   > **[K]** Keep and continue   **[U]** Update fields   **[R]** Reset

   - **[K]**: proceed to Phase 1 using this context.
   - **[U]**: present each field for review; developer amends; write updated record; proceed to Phase 1.
   - **[R]**: discard and run discovery (steps 1a–1e below).

   **If no record exists**, run context discovery:

   1a. Ask product type:

   > What type of product is this? (marketing website, productivity app, developer tool, etc. — or describe freely)
   >
   > **[?]** Get help — scan project and propose

   On **[?]**: scan `taproot/`, existing specs, and codebase for signals; propose a product type with explanation; developer confirms or adjusts.

   1b. Ask target audience:

   > Who are the primary users, and what do they come here to accomplish?
   >
   > **[?]** Get help — infer from project context

   On **[?]**: scan specs and codebase for audience signals; propose with reasoning; developer confirms or adjusts.

   1c. Ask quality goals:

   > Which 2–3 quality goals matter most? (visual polish, performance, simplicity, trust, accessibility, discoverability, …)
   >
   > **[?]** Get help — suggest based on product type and audience

   On **[?]**: draw on domain knowledge for the product archetype; propose 2–3 goals with rationale and one or two alternatives; developer confirms or adjusts.

   1d. Present summary for confirmation:

   > Product type: [value] · Target audience: [value] · Quality goals: [value]
   >
   > **[Y]** Confirm and write   **[E]** Edit a field   **[S]** Skip — use generic defaults

   1e. On **[Y]**: write `taproot/global-truths/project-context_intent.md`:
   ```markdown
   ## Project context

   - **Product type:** [value]
   - **Target audience:** [value]
   - **Quality goals:** [value]
   ```
   Report: "✓ Project context written. Sub-skill questions will use this to propose archetype-appropriate defaults."

   On **[S]**: note "Skipping — modules will use generic defaults." Proceed to Phase 1.

### Phase 1 — Scan existing coverage

2. Scan `taproot/global-truths/` for existing UX truth files matching the pattern `ux-<aspect>_behaviour.md`. Present the coverage summary:

   ```
   UX module — coverage scan
   ─────────────────────────────────────────────────────────
    aspect          truth file                    status
   ─────────────────────────────────────────────────────────
    orientation     ux-orientation_behaviour.md   ✓ exists
    flow            ux-flow_behaviour.md          ✗ missing
    feedback        ux-feedback_behaviour.md      ✗ missing
    input           ux-input_behaviour.md         ✗ missing
    presentation    ux-presentation_behaviour.md  ✗ missing
    language        ux-language_behaviour.md      ✗ missing
    accessibility   ux-accessibility_behaviour.md ✗ missing
    adaptation      ux-adaptation_behaviour.md    ✗ missing
    consistency     ux-consistency_behaviour.md   ✗ missing
    visual          ux-visual_behaviour.md        ✗ missing
   ─────────────────────────────────────────────────────────
   ```

3. If `aspects` was specified, filter to only those aspects and note which are being skipped.

4. Confirm surface type if not provided:

   > What surface type does this project target? (cli / web / mobile / desktop)
   >
   > Enter one — or describe the mix (e.g. "web + cli tools") and the relevant conventions will be noted per aspect.

### Phase 2 — Run sub-skills in sequence

5. For each aspect in scope (in order: orientation → flow → feedback → input → presentation → language → accessibility → adaptation → consistency → visual):

   a. Announce: `── Aspect [N/9]: <aspect> ──`
   b. If the truth file already exists: "Found existing `ux-<aspect>_behaviour.md` — do you want to review and extend it, or skip this aspect?"
      - **[A]** Extend — proceed with sub-skill
      - **[L]** Later — skip this aspect for now
   c. Invoke the sub-skill for this aspect, passing `surface` and the established project context. The sub-skill runs its scan, elicitation, and write steps using the context to propose archetype-appropriate defaults. It does **not** show its own What's next block when invoked from here.
   d. After the sub-skill completes, confirm: "Aspect [N/9] done. Continue to next?" (omit if all aspects remain)

6. After all aspects complete (or developer says Done):

   > **UX module session summary**
   >
   > Completed: [list of aspects with truth files written]
   > Skipped: [list, or "none"]
   >
   > The conventions in these files are now applied as behaviour-scoped truths at commit time.

### Phase 3 — DoD wiring

7. Ask:

   > Wire UX conventions as a DoD condition?
   >
   > Adding `check-if-affected-by: taproot-modules/user-experience` to `taproot/settings.yaml` causes agents to verify UX conventions at commit time for every implementation.
   >
   > **[A]** Yes — add to `taproot/settings.yaml`  **[B]** No — I'll add it manually  **[C]** Skip

8. On **[A]**: read `taproot/settings.yaml`. Add to `definitionOfDone`:
   ```yaml
   - check-if-affected-by: taproot-modules/user-experience
   ```
   Report: "✓ Added `check-if-affected-by: taproot-modules/user-experience` to `taproot/settings.yaml`."

   On **[B]**: show the line to add:
   ```yaml
   # In taproot/settings.yaml, under definitionOfDone:
   - check-if-affected-by: taproot-modules/user-experience
   ```

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-commit` — commit the new truth files and settings update
[2] `/tr-ux-define` — run again to extend remaining aspects
[3] `/tr-status` — view coverage snapshot

## Output

- Up to 9 truth files written to `taproot/global-truths/` (one per aspect completed)
- `taproot/settings.yaml` updated with DoD condition (if confirmed)

## CLI Dependencies

None.

## Notes

- Sub-skills invoked from this orchestrator suppress their own What's next blocks. The orchestrator presents a single summary at the end.
- Re-running `/tr-ux-define` on a project with some aspects already defined picks up from where it left off — only aspects with missing truth files are presented as `✗ missing`.
- To define a single aspect without the orchestrator, invoke its sub-skill directly: `/tr-ux-orientation`, `/tr-ux-flow`, `/tr-ux-visual`, etc.
- Surface type, once confirmed in Phase 1, is passed to all sub-skills so the developer is not asked again.
