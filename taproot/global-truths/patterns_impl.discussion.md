## Batch skill progress persistence

**Correct:** `discover-truths` writes `.taproot/sessions/discover-truths-status.md` after each confirmed candidate.
**Incorrect:** A skill processes 15 items and only writes state at the end — context compression loses all progress.

**Reference implementation:** `taproot/plan.md` (used by `plan-execute`) already survives compression by design. Per-skill status files follow the same pattern at smaller scope.

**Note on parallel execution:** This pattern assumes single-agent execution. When parallel agent execution is supported, locking and status file ownership will need to be revisited.

## Build-time vs runtime config split

**Correct:** `taproot update` rewrites skill files with German headers. `taproot validate-format` loads the same language pack at runtime to accept German headers. Both read `settings.yaml`.
**Incorrect:** Runtime validator hardcodes English section headers while build-time installer applies a German language pack — the validator rejects documents authored using the installed skills.

**Invariant:** If a config value affects both installed artefacts AND runtime tool behaviour, changing one without the other produces an inconsistent system.

**Implementation constraint:** Runtime-path config loading happens at command boundaries (entry points), not inside core modules. Core modules (`src/core/`) receive config as function parameters.
