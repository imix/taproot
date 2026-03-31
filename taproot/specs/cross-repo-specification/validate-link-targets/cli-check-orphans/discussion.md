# Discussion: CLI check-orphans

## Session
- **Date:** 2026-03-31
- **Skill:** tr-implement

## Pivotal Questions

1. **Where does repos.yaml live?** Two options: `.taproot/repos.yaml` (keeps it alongside the existing session/cache files) vs `taproot/repos.yaml` (committed project store). Chose `.taproot/` because it must be gitignored — it's a local developer config, not a project artefact. The parent intent explicitly states this.

2. **How should CI environments handle missing repos.yaml?** Option A: fail loudly (all links unresolvable). Option B: `TAPROOT_OFFLINE=1` env var to skip. Chose Option B — CI pipelines that don't need link validation shouldn't be forced to fail; the opt-in env var keeps the default strict while giving CI an escape hatch.

3. **How far does cycle detection go?** Option A: direct cycles only (one hop). Option B: full transitive DAG traversal (follow links into source repos). Chose a middle ground for v1: one level of transitive traversal (follow resolved source repo link files one hop). Full DAG traversal deferred — the visited-set architecture supports extending it later without rework.

## Alternatives Considered

- **YAML frontmatter for link files** — rejected in favour of markdown bold-label parsing (`**Repo:** ...`). Taproot specs are markdown-first; introducing YAML frontmatter creates an inconsistency and requires parser changes.
- **`taproot/repos.yaml` (committed)** — rejected because the repos.yaml contains local filesystem paths that are developer-specific and must not be committed. This was the original design intent.
- **Separate `check-links` command** — rejected; extending `check-orphans` is the right fit since "orphan" already covers broken references, and link files are a new type of reference. Avoids fragmenting the CLI.

## Decision

Extend `check-orphans` with a new `checkLinkTargets()` path that scans for link files, loads `.taproot/repos.yaml`, resolves targets, and reports violations using new `LINK_*` codes. The `TAPROOT_OFFLINE=1` env var allows CI to skip link resolution. The pre-commit hook calls the same resolution logic and respects `linkValidation: warn-only` in settings. A pure `src/core/link-parser.ts` module owns all link file parsing and repos.yaml loading, keeping the command thin.

## Open Questions

- Full transitive cycle detection (beyond one hop) — deferred to a follow-up iteration.
- Should `validate-format` also validate link file format (required fields)? Separate AC in `define-cross-repo-link`. Not in scope for this implementation.
