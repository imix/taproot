# Skill: security-define

## Description

Activate the security quality module: establish project context, scan for existing coverage across 5 layers, walk through each layer via sub-skills, and optionally wire a DoD condition so agents apply security conventions automatically. Run once to bootstrap the module; re-run at any time to extend or revisit layers.

## Inputs

- `layers` (optional): Comma-separated subset of layers to run — `rules`, `local-tooling`, `ci-cd`, `hardening`, `periodic-review`. Defaults to all 5.

## Steps

### Phase 0 — Establish project context

1. Read `taproot/global-truths/project-context_intent.md` if it exists. Also read `taproot/global-truths/security-context_intent.md` if it exists.

   **If security context exists:**

   > **Security context found**
   >
   > Stack: [value]   Deployment: [value]   Threat profile: [value]
   >
   > **[K]** Keep and continue   **[U]** Update   **[R]** Reset

   - **[K]**: proceed to Phase 1.
   - **[U]**: present each field; developer amends; write updated record; proceed.
   - **[R]**: discard and run discovery below.

   **If no security context**, run discovery:

   1a. Ask stack:

   > What language and framework does this project use? (e.g. Node/Express, Python/FastAPI, Go, Rails)
   >
   > **[H]** Get help — detect from project files

   On **[H]**: scan `package.json`, `requirements.txt`, `go.mod`, or equivalent; propose stack with explanation; developer confirms.

   1b. Ask deployment:

   > Where does this project deploy? (e.g. Docker/K8s, AWS Lambda, Heroku, bare VPS, desktop app, CLI tool)
   >
   > **[H]** Get help — detect from project config

   On **[H]**: scan Dockerfile, CI config, cloud config files; propose deployment target; developer confirms.

   1c. Ask threat profile:

   > What best describes this project's threat surface? (public API, internal tool, handles PII, financial data, open-source CLI, other)
   >
   > **[H]** Get help — infer from specs and codebase

   On **[H]**: scan taproot specs and codebase for signals; propose threat profile; developer confirms.

   1d. Summarise:

   > Stack: [value] · Deployment: [value] · Threat profile: [value]
   >
   > **[Y]** Confirm and write   **[E]** Edit   **[S]** Skip — use generic defaults

   1e. On **[Y]**: write `taproot/global-truths/security-context_intent.md`:
   ```markdown
   ## Security context

   - **Stack:** [value]
   - **Deployment:** [value]
   - **Threat profile:** [value]
   ```
   Report: "✓ Security context written."

   On **[S]**: note "Skipping — layers will use generic defaults." Proceed to Phase 1.

### Phase 1 — Scan existing coverage

2. Scan `taproot/global-truths/` for existing security truth files matching `security-<layer>_behaviour.md`. Present coverage:

   ```
   Security module — coverage scan
   ───────────────────────────────────────────────────────────────
    layer             truth file                          status
   ───────────────────────────────────────────────────────────────
    rules             security-rules_behaviour.md         ✗ missing
    local-tooling     security-local-tooling_behaviour.md ✗ missing
    ci-cd             security-ci-cd_behaviour.md         ✗ missing
    hardening         security-hardening_behaviour.md     ✗ missing
    periodic-review   security-periodic-review_behaviour.md ✗ missing
   ───────────────────────────────────────────────────────────────
   ```

3. If `layers` was specified, filter to only those layers.

### Phase 2 — Run sub-skills in sequence

4. For each layer in scope (in order: rules → local-tooling → ci-cd → hardening → periodic-review):

   a. Announce: `── Layer [N/5]: <layer> ──`
   b. If the truth file already exists: "Found existing `security-<layer>_behaviour.md` — review and extend, or skip?"
      - **[A]** Extend — proceed with sub-skill
      - **[L]** Later — skip this layer for now
   c. Invoke the sub-skill for this layer, passing the established security context. The sub-skill runs its scan, elicitation, and write steps. It does **not** show its own What's next block when invoked from here.
   d. After the sub-skill completes, confirm: "Layer [N/5] done. Continue to next?" (omit if last layer)

5. After all layers complete (or developer says Done):

   > **Security module session summary**
   >
   > Completed: [list of layers with truth files written]
   > Skipped: [list, or "none"]
   >
   > The conventions in these files are now applied as behaviour-scoped truths at commit time.

### Phase 3 — DoD wiring

6. Read `taproot/settings.yaml` and check whether `check-if-affected-by: taproot-modules/security` is already present in `definitionOfDone`. If it is, skip this step entirely and note "Security DoD condition already wired." in the session summary.

   Otherwise, ask:

   > Wire security conventions as a DoD condition?
   >
   > Adding `check-if-affected-by: taproot-modules/security` to `taproot/settings.yaml` causes agents to verify security conventions at commit time for every implementation.
   >
   > **[A]** Yes — add to `taproot/settings.yaml`   **[B]** No — I'll add it manually   **[C]** Skip

7. On **[A]**: read `taproot/settings.yaml`. Add to `definitionOfDone`:
   ```yaml
   - check-if-affected-by: taproot-modules/security
   ```
   Report: "✓ Added `check-if-affected-by: taproot-modules/security` to `taproot/settings.yaml`."

   On **[B]**: show the line to add:
   ```yaml
   # In taproot/settings.yaml, under definitionOfDone:
   - check-if-affected-by: taproot-modules/security
   ```

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-commit` — commit the new truth files and settings update
[2] `/tr-security-define` — run again to extend remaining layers
[3] `/tr-security-periodic-review` — run the periodic review against the configured checklist

## Output

- Up to 5 truth files written to `taproot/global-truths/` (one per layer completed)
- `taproot/settings.yaml` updated with DoD condition (if confirmed)

## CLI Dependencies

None.

## Notes

- Sub-skills invoked from this orchestrator suppress their own What's next blocks. The orchestrator presents a single summary at the end.
- Re-running `/tr-security-define` on a project with some layers already configured picks up from where it left off.
- To configure a single layer without the orchestrator, invoke its sub-skill directly: `/tr-security-rules`, `/tr-security-local-tooling`, etc.
- The `periodic-review` sub-skill has two modes: setup (run from orchestrator) and run (invoke directly to execute the review).
