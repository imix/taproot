# Discussion: Hook Extension

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

**How does a pre-commit hook perform an LLM semantic check?**
It can't — hooks run synchronously and can't wait for an LLM. The solution: `tr-commit` is the primary enforcement path. The agent performs the semantic check via the skill, and if approved, calls `taproot truth-sign` to write a session hash. The hook validates the hash, providing protection against bypassing `tr-commit` with a direct `git commit`.

**Where to store the truth-check approval record?**
Options considered: inline in usecase.md (`## Truth Resolutions`), sidecar file per spec, centralised `.taproot/.truth-check-session`. The centralised session file was chosen — it avoids polluting spec files with session metadata, and is naturally ephemeral (not committed to git).

**Should `global-truths/` be excluded from the hierarchy walker?**
Yes — it is not an intent/behaviour/impl folder. Adding it to `DEFAULT_EXCLUDE` (alongside `skills/`) prevents false ORPHAN_FOLDER and INVALID_FOLDER_NAME errors from validate-structure.

## Alternatives Considered
- **Inline LLM call in hook**: rejected — too slow (5-30s per commit), requires credentials in hook environment
- **`## Truth Resolutions` section in usecase.md**: rejected — pollutes spec files with session metadata; would require agents to modify every spec on every truth check
- **Warning-only hook (no block)**: rejected — the usecase requires the commit to be blocked when no valid session exists; a warning-only mode undermines the enforcement goal

## Decision
Two-tier enforcement: `tr-commit` skill performs the semantic check (agent reads truths + docs, evaluates consistency), then writes a session hash. The hook validates the hash at commit time, blocking if missing or stale. This separates semantic reasoning (agent) from enforcement (hook).

## Open Questions
- The error condition "hook times out during agent check" (usecase error condition) is not directly implementable in the current model — if the agent never calls `truth-sign`, the hook blocks. A future improvement: configurable `TAPROOT_TRUTH_CHECK=skip` env var to allow bypass with a warning, for CI environments.
