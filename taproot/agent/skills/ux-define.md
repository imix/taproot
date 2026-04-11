# Skill: ux-define

## Description

Activate the user-experience quality module: scan for existing UX coverage, walk through each of the 9 UX aspects, elicit conventions via sub-skills, and optionally wire a DoD condition so agents apply UX conventions automatically. Run once to bootstrap the module; re-run at any time to extend or revisit aspects.

## Inputs

- `aspects` (optional): Comma-separated subset of aspects to run — `orientation`, `flow`, `feedback`, `input`, `presentation`, `language`, `accessibility`, `adaptation`, `consistency`. Defaults to all 9.
- `surface` (optional): Target surface type — `cli`, `web`, `mobile`, `desktop`. Passed to each sub-skill. If omitted, the first sub-skill asks; the answer is reused for all subsequent sub-skills.

## Steps

### Phase 1 — Scan existing coverage

1. Scan `taproot/global-truths/` for existing UX truth files matching the pattern `ux-<aspect>_behaviour.md`.

2. Present the coverage summary:

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
   ─────────────────────────────────────────────────────────
   ```

3. If `aspects` was specified, filter to only those aspects and note which are being skipped.

4. Confirm surface type if not provided:

   > What surface type does this project target? (cli / web / mobile / desktop)
   >
   > Enter one — or describe the mix (e.g. "web + cli tools") and the relevant conventions will be noted per aspect.

### Phase 2 — Run sub-skills in sequence

5. For each aspect in scope (in order: orientation → flow → feedback → input → presentation → language → accessibility → adaptation → consistency):

   a. Announce: `── Aspect [N/9]: <aspect> ──`
   b. If the truth file already exists: "Found existing `ux-<aspect>_behaviour.md` — do you want to review and extend it, or skip this aspect?"
      - **[A]** Extend — proceed with sub-skill
      - **[L]** Later — skip this aspect for now
   c. Invoke the sub-skill for this aspect, passing `surface`. The sub-skill runs its scan, elicitation, and write steps. It does **not** show its own What's next block when invoked from here.
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
- To define a single aspect without the orchestrator, invoke its sub-skill directly: `/tr-ux-orientation`, `/tr-ux-flow`, etc.
- Surface type, once confirmed in Phase 1, is passed to all sub-skills so the developer is not asked again.
