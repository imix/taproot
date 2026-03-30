# Implementation Patterns

## Batch Skill Progress Persistence

Skills that process items in steps or batches (e.g. `discover-truths`, `sweep`) **must** write their progress to a status file so sessions survive context compression.

**File path:** `.taproot/sessions/<skill-slug>-status.md`

**Rules:**
- Write after each confirmed item — not just at phase boundaries
- On startup: check for an existing status file and offer to resume or restart
- On clean completion: delete the status file
- On next run after an interrupted session: overwrite the existing status file
- Format: a checklist of items with `[x]` / `[ ]` markers, a phase/cursor indicator, and a Notes section for session context

**No shared pointer file.** The status file name is self-documenting. An agent resuming after compression scans `.taproot/sessions/` to find where it was. A separate `working-on.md` is not needed and would conflict under parallel execution.

**Reference implementation:** `taproot/plan.md` (used by `plan-execute`) — already survives compression by design. Per-skill status files follow the same pattern at a smaller scope.

**Note on parallel execution:** This pattern assumes single-agent execution. When parallel agent execution is supported, locking and status file ownership will need to be revisited.

**Applies to:** any skill that iterates over a list of items where each item requires agent action or developer confirmation and the list may be too long to complete in a single context window.

## Build-Time vs Runtime Config Split

Config that affects taproot's behaviour has two distinct application points — build-time and runtime — and the split is load-bearing.

**Build-time config** (applied during `taproot update` / `taproot init`):
- Transforms installed artefacts on disk: skill files (`.taproot/skills/`, `taproot/agent/skills/`), adapter instruction files (`.claude/commands/`, `CONVENTIONS.md`, `.cursorrules`, etc.)
- Examples: `language:` pack substitution rewrites section header tokens in skill files; `vocabulary:` overrides replace domain terms in skill prose
- Effect is durable: re-running `taproot update` re-applies the config to freshly installed files, so customisations survive version upgrades

**Runtime config** (read from `settings.yaml` on each CLI invocation):
- Influences tool behaviour directly without touching installed files: `taproot validate-format` and `taproot commithook` load the language pack at startup and use it as the accepted section header set
- Effect is immediate: changing `language:` in `settings.yaml` takes effect on the next CLI call with no `taproot update` needed
- Stateless per invocation: no module-level caching; config is re-read on every call

**The invariant:** if a config value affects both installed artefacts AND runtime tool behaviour, the two application points must stay in sync. Language pack config is the canonical example: `taproot update` rewrites skill files with German headers; `taproot validate-format` reads the same pack at runtime to accept German headers. If one is applied without the other, the validator will reject documents authored using the installed skills.

**Implementation constraint:** runtime-path config loading must happen at command boundaries (entry points), not inside core modules. Core modules (`src/core/`) receive config as function parameters — no direct `settings.yaml` reads inside pure logic.

**Applies to:** any feature where settings affect both (a) the content of generated/installed text files and (b) the acceptance rules of validators or hooks.
