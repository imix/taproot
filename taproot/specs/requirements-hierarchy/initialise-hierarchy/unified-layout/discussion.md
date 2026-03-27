# Discussion: Unified taproot/ Layout

## Session
- **Date:** 2026-03-27
- **Skill:** tr-implement

## Pivotal Questions

**1. Should `.taproot/` be eliminated entirely, or retained for runtime scratch?**
The original proposal was to unify everything into `taproot/`. The key insight during design: session state, truth-check sessions, and test artefacts are genuinely ephemeral — they should not be committed. Making `taproot/` a mix of versioned content and gitignored runtime files would be confusing. Decision: `.taproot/` stays as a gitignored scratch directory; all _content_ moves to `taproot/agent/`.

**2. How do existing projects migrate without a breaking change?**
`taproot update` is the natural migration point — it already rewrites adapter files and could migrate directories. Using `resolveAgentDir()` with a fallback to `.taproot/` means old-layout projects continue to work without any manual steps. The migration happens silently on the next `taproot update` run.

**3. What does `validate-structure` do when `root: taproot/` and `taproot/agent/` exists?**
When `root` is set to `taproot/`, the hierarchy walker starts at `taproot/` and treats every subdirectory as a potential intent/behaviour folder. `taproot/agent/` and `taproot/specs/` contain no `intent.md` or `usecase.md`, so the walker would flag them as orphan folders. Fix: add `agent` and `specs` to `DEFAULT_EXCLUDE` — the same mechanism already used for `skills`, `global-truths`, and `node_modules`.

## Alternatives Considered
- **Keep `.taproot/` for agent content, add symlinks** — rejected: symlinks break on Windows and add tooling complexity for no user benefit.
- **New `agent/` directory at project root** — rejected: places agent-specific files outside the taproot system boundary; makes `taproot/` still required alongside `agent/`, solving nothing.
- **Move requirements hierarchy to `taproot/specs/` only, keep root flat** — this is the chosen approach; the `specs/` subfolder makes the hierarchy intent clear and keeps `taproot/` as a namespace for all taproot content.

## Decision
Unify everything under `taproot/` with `specs/` for requirements, `agent/` for framework files, and `settings.yaml` at the root. `.taproot/` is retained only for gitignored runtime state. Backward compatibility is provided by `resolveAgentDir()` (for reading) and migration logic in `removeStale()` (for writing). The `DEFAULT_EXCLUDE` extension ensures the structure validator remains accurate under the new layout. `docs/architecture.md` must be updated to remove the now-superseded `.taproot/` constraint and document the new layout.

## Open Questions
- ✅ Resolved (same session): The `requirements-hierarchy/intent.md` constraint "framework files (skills, config) live in `.taproot/`" was updated in the same commit to read: "framework files (skills, config) live in `taproot/agent/`; project settings at `taproot/settings.yaml`; runtime ephemeral files in `.taproot/` (gitignored)".
