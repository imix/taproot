# Skill: arch-define

## Description

Activate the architecture quality module: scan for existing architecture convention coverage, walk through each of the 7 aspects, elicit conventions via sub-skills, and optionally wire DoD and DoR conditions. Run once to bootstrap the module; re-run at any time to extend or revisit aspects.

## Inputs

- `aspects` (optional): Comma-separated subset of aspects to run — `interface-design`, `code-reuse`, `dependency-governance`, `module-boundaries`, `error-handling`, `test-structure`, `naming`. Defaults to all 7.

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

   > What type of product is this? (CLI tool, web service, library, mobile app, etc. — or describe freely)
   >
   > **[H]** Get help — scan project and propose

   On **[H]**: scan `taproot/`, existing specs, and codebase for signals; propose a product type with explanation; developer confirms or adjusts.

   1b. Ask tech stack:

   > What is the primary language and tech stack? (e.g. TypeScript/Node, Go, Python/FastAPI)
   >
   > **[H]** Get help — infer from project files

   On **[H]**: scan `package.json`, `go.mod`, `requirements.txt`, and similar for stack signals; propose with reasoning; developer confirms or adjusts.

   1c. Ask structural goals:

   > Which 2–3 structural quality goals matter most? (clear boundaries, minimal dependencies, DRY, consistent naming, strict layering, testability)
   >
   > **[H]** Get help — suggest based on product type and stack

   On **[H]**: draw on domain knowledge for the product type; propose 2–3 goals with rationale; developer confirms or adjusts.

   1d. Present summary for confirmation:

   > Product type: [value] · Stack: [value] · Structural goals: [value]
   >
   > **[Y]** Confirm and write   **[E]** Edit a field   **[S]** Skip — use generic defaults

   1e. On **[Y]**: write `taproot/global-truths/project-context_intent.md`:
   ```markdown
   ## Project context

   - **Product type:** [value]
   - **Stack:** [value]
   - **Structural goals:** [value]
   ```
   Report: "✓ Project context written. Sub-skill questions will use this to propose stack-appropriate defaults."

   On **[S]**: note "Skipping — module will use generic defaults." Proceed to Phase 0b.

### Phase 0b — Declare architectural style

Run the `arch-style` sub-skill (see `arch-style.md`). Pass the established project context. The sub-skill does **not** show its own What's next block when invoked from here.

On return, proceed to Phase 1.

### Phase 1 — Scan existing coverage

2. Scan `taproot/global-truths/` for existing architecture truth files. Present the coverage summary:

   ```
   Architecture module — coverage scan
   ──────────────────────────────────────────────────────────────────────
    step/aspect             truth file                                status
   ──────────────────────────────────────────────────────────────────────
    architectural style     arch-style_behaviour.md                   ✗ missing
    interface-design        arch-interface-design_behaviour.md        ✗ missing
    code-reuse              arch-code-reuse_behaviour.md              ✗ missing
    dependency-governance   arch-dependency-governance_behaviour.md   ✗ missing
    module-boundaries       arch-module-boundaries_behaviour.md       ✗ missing
    error-handling          arch-error-handling_behaviour.md          ✗ missing
    test-structure          arch-test-structure_behaviour.md          ✗ missing
    naming                  arch-naming_behaviour.md                  ✗ missing
   ──────────────────────────────────────────────────────────────────────
   ```

3. If `aspects` was specified, filter to only those aspects and note which are being skipped.

### Phase 2 — Run sub-skills in sequence

4. For each aspect in scope (in order: interface-design → code-reuse → dependency-governance → module-boundaries → error-handling → test-structure → naming):

   a. Announce: `── Aspect [N/7]: <aspect> ──`
   b. If the truth file already exists: "Found existing `arch-<aspect>_behaviour.md` — do you want to review and extend it, or skip this aspect?"
      - **[A]** Extend — proceed with sub-skill
      - **[L]** Later — skip this aspect for now
   c. Invoke the sub-skill for this aspect, passing the established project context. The sub-skill runs its scan, elicitation, and write steps. It does **not** show its own What's next block when invoked from here.
   d. After the sub-skill completes, confirm: "Aspect [N/7] done. Continue to next?" (omit if all aspects remain)

5. After all aspects complete (or developer says Done):

   > **Architecture module session summary**
   >
   > Completed: [list of aspects with truth files written]
   > Skipped: [list, or "none"]
   >
   > The conventions in these files are now applied as behaviour-scoped truths at commit time.

6. Offer `/tr-sweep`:

   > Run `/tr-sweep` to scan existing impl.md files for implementations that may not conform to the newly written conventions?
   >
   > **[A]** Yes — run sweep   **[L]** Later

   On **[A]**: invoke `/tr-sweep` with task "flag any implementation that may conflict with the newly written architecture conventions" scoped to `taproot/`.

### Phase 3 — Dependency governance wiring

7. If `dependency-governance` was completed in this session:
   Read `taproot/settings.yaml` and check whether `check-if-affected-by: taproot-modules/architecture` is already present in `definitionOfDone`. If it is, skip this step entirely — the module check already covers dependency governance at commit time.

   Otherwise:

   > Wire a DoD script to detect unapproved dependency additions?
   >
   > Provide a command that exits non-zero when new dependencies appear without approval. The command runs at every implementation commit as a `run:` DoD condition.
   >
   > Example: `git diff HEAD^ -- package-lock.json | grep "^+" | grep '"version"'`
   >
   > **[A]** Yes — enter command   **[B]** No — convention in truth file is sufficient

   On **[A]**: read `taproot/settings.yaml`. Add to `definitionOfDone`:
   ```yaml
   - run: <entered-command>
     correction: "New dependencies detected — confirm each was approved before committing"
   ```
   Report: "✓ Dependency governance DoD script wired."

   On **[B]**: note "Relying on global truth convention only."

### Phase 4 — DoR check: wiring

8. If `interface-design` or `code-reuse` was completed in this session:

   > Wire DoR check conditions to catch approach decisions before coding starts?
   >
   > This adds `check:` entries to `definitionOfReady` in `taproot/settings.yaml`.
   >
   > **[A]** Yes — wire all applicable checks   **[B]** Wire selectively   **[C]** No — skip DoR wiring

   On **[A]**: add to `definitionOfReady` for each completed aspect that has a DoR check:
   - interface-design → `check: "does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md?"`
   - code-reuse → `check: "does an existing abstraction already cover this? See arch-code-reuse_behaviour.md"`

   Report: "✓ DoR check conditions wired for: [list]."

   On **[B]**: offer each check individually; developer confirms or declines per check.

   On **[C]**: show the check lines to add:
   ```yaml
   # In taproot/settings.yaml, under definitionOfReady:
   - check: "does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md?"
   - check: "does an existing abstraction already cover this? See arch-code-reuse_behaviour.md"
   ```

### Phase 5 — DoD wiring

9. Read `taproot/settings.yaml` and check whether `check-if-affected-by: taproot-modules/architecture` is already present in `definitionOfDone`. If it is, skip this step entirely and note "Architecture DoD condition already wired." in the session summary.

   Otherwise, ask:

   > Wire architecture conventions as a DoD condition?
   >
   > Adding `check-if-affected-by: taproot-modules/architecture` to `taproot/settings.yaml` causes agents to verify architecture conventions at commit time for every implementation.
   >
   > **[A]** Yes — add to `taproot/settings.yaml`   **[B]** No — I'll add it manually   **[C]** Skip

10. On **[A]**: read `taproot/settings.yaml`. Add to `definitionOfDone`:
    ```yaml
    - check-if-affected-by: taproot-modules/architecture
    ```
    Report: "✓ Added `check-if-affected-by: taproot-modules/architecture` to `taproot/settings.yaml`."

    On **[B]**: show the line to add:
    ```yaml
    # In taproot/settings.yaml, under definitionOfDone:
    - check-if-affected-by: taproot-modules/architecture
    ```

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-commit` — commit the new truth files and settings update
[2] `/tr-arch-define` — run again to extend remaining aspects
[3] `/tr-status` — view coverage snapshot

## Output

- Up to 7 truth files written to `taproot/global-truths/` (one per aspect completed)
- `taproot/settings.yaml` updated with DoR check conditions (if confirmed) and DoD condition (if confirmed)

## CLI Dependencies

None.

## Notes

- Sub-skills invoked from this orchestrator suppress their own What's next blocks. The orchestrator presents a single summary at the end.
- Re-running `/tr-arch-define` on a project with some aspects already defined picks up from where it left off — only aspects with missing truth files are presented as `✗ missing`.
- To define a single aspect without the orchestrator, invoke its sub-skill directly: `/tr-arch-interface-design`, `/tr-arch-code-reuse`, etc.
- Dependency governance does not use targeted questions — the convention text is universal. The sub-skill presents it for confirmation and offers the optional DoD run: script.
