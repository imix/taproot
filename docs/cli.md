# CLI Reference

The Taproot CLI handles setup, validation, and reporting. It does not generate content — that's what the agent skills do. The rule of thumb: use `/tr-*` commands when you want the AI to write or update documents; use `taproot` CLI commands to validate, report, and check structural integrity.

---

## Setup

### `taproot init`

```bash
taproot init [--with-hooks] [--with-ci github|gitlab] [--with-skills] [--agent claude|cursor|copilot|windsurf|generic|all]
```

Initializes Taproot in the current directory. Creates `taproot/` and `.taproot/settings.yaml` if they don't exist, then installs whichever integrations you request.

| Option | Effect |
|--------|--------|
| `--with-hooks` | Installs `.git/hooks/pre-commit` running `taproot commithook` |
| `--with-ci github` | Generates `.github/workflows/taproot.yml` with validate-structure, validate-format, and check-orphans |
| `--with-ci gitlab` | Generates a `taproot-validate` job in `.gitlab-ci.yml` |
| `--with-skills` | Copies skill definitions to `.taproot/skills/`. Implied by `--agent claude` — only needed if you want skills without a Claude adapter. |
| `--agent <name>` | Generates agent adapter files (see [Agent Setup](agents.md)) |

Running `taproot init` again on an existing project is safe — it skips files that already exist and reports `exists` for each.

### `taproot update`

```bash
taproot update [--with-hooks]
```

Refreshes installed agent adapters and skills to the current version. Run this after upgrading the `taproot` package.

The update command also:
- Removes stale artefacts from older Taproot layouts (e.g., the pre-v0.1 `taproot/skills/` directory)
- Refreshes `.taproot/docs/` with the current taproot documentation (patterns, architecture, security, etc.) so agent skills have up-to-date reference material
- Runs a cross-link refresh: adds missing `## Behaviours <!-- taproot-managed -->` sections to `intent.md` files and `## Implementations <!-- taproot-managed -->` sections to `usecase.md` files, then appends any missing child links and prunes any links to non-existent files
- Migrates old `taproot validate-structure` / `taproot validate-format` pre-commit hooks to the newer `taproot commithook` format

---

## Validation

### `taproot validate-structure`

```bash
taproot validate-structure [--path taproot/] [--strict]
```

Verifies that the folder hierarchy follows Taproot's nesting rules:
- Intent folders contain `intent.md` and optionally behaviour subdirectories
- Behaviour folders contain `usecase.md` and optionally impl or sub-behaviour subdirectories
- Implementation folders contain `impl.md` and are always leaves (no children)
- Folder names match the allowed pattern (lowercase kebab-case)

Exit 0 if valid, exit 1 with violations. Use `--strict` to treat warnings as errors.

### `taproot validate-format`

```bash
taproot validate-format [--path taproot/] [--fix]
```

Validates that marker files (`intent.md`, `usecase.md`, `impl.md`) conform to their schemas — required sections present, required fields populated, state values from the allowed set. Also checks:

- Every `intent.md` with child behaviour folders has a `## Behaviours <!-- taproot-managed -->` section
- Every `usecase.md` with child impl folders has an `## Implementations <!-- taproot-managed -->` section
- Every link in those sections resolves to an existing file (detects `STALE_LINK`)
- `impl.md` `## Behaviour` references point to existing `usecase.md` files
- Every `usecase.md` with child impl folders has a `## Acceptance Criteria` section (warns `MISSING_ACCEPTANCE_CRITERIA` if absent)
- Acceptance criterion IDs (`AC-N` and `NFR-N`) are unique within their respective prefix namespace within a file (errors `DUPLICATE_CRITERION_ID` if duplicate)

Use `--fix` to scaffold missing section headers automatically. This is safe to run repeatedly — it only adds what's missing, never overwrites existing content.

### `taproot acceptance-check`

```bash
taproot acceptance-check [--path taproot/] [--tests <dir>] [--format json]
```

Verifies that every acceptance criterion ID (`AC-N` and `NFR-N`) defined in `## Acceptance Criteria` sections is referenced by at least one test or verification file, and that no test file references a criterion that doesn't exist in any spec.

Reports three categories:
- **Uncovered:** criterion IDs present in specs but not found in any test file (exit 1)
- **Orphaned:** criterion IDs found in test files but not defined in any `usecase.md` (exit 1)
- **Missing sections:** `usecase.md` files with child implementations but no `## Acceptance Criteria` section (warning only)

| Option | Effect |
|--------|--------|
| `--path <path>` | Limit spec collection to a subtree; test files are still scanned globally |
| `--tests <dir>` | Override test directory (repeatable; defaults to `test/`, `tests/`, `spec/`) |
| `--format json` | Output a JSON report instead of human-readable text |

Criterion ID matching is grep-based: the strings `AC-N` and `NFR-N` must appear verbatim somewhere in the test or verification file. Common patterns: `it('AC-1: ...')`, `describe('AC-3')`, `// covers AC-2`, `// NFR-1 verified by load-test/search.k6.js`. NFR-N references may point to load tests, security scan configs, or manual verification artefacts — any file containing the verbatim ID counts. Deprecated criteria (lines starting with `~~**AC-N` or `~~**NFR-N`) are excluded from the check.

---

## Traceability

### `taproot link-commits`

```bash
taproot link-commits [--since <date|hash>] [--dry-run]
```

Scans the git log for commits matching the conventional format (`taproot(<path>): message` or `Taproot: <path>` trailer) and adds them to the `## Commits` section of the corresponding `impl.md`. Use `--dry-run` to preview changes without writing them. Use `--since` to limit the scan to recent commits.

### `taproot check-orphans`

```bash
taproot check-orphans [--path taproot/] [--include-unimplemented]
```

Finds broken references across the hierarchy:
- Source files listed in `impl.md` that no longer exist on disk
- `## Behaviour` references in `impl.md` that point to non-existent `usecase.md` files
- Commits in `## Commits` that are not in git history

Use `--include-unimplemented` to also report behaviours with no implementations (useful for coverage gaps, not just broken links).

---

## Reporting

### `taproot coverage`

```bash
taproot coverage [--path taproot/] [--format tree|json|markdown|context]
```

Summarizes implementation completeness across the hierarchy: how many behaviours have at least one implementation, how many are still planned. The default output is a tree view. Use `--format context` to write `taproot/CONTEXT.md` — a compact summary suitable for pasting into an agent context window.

### `taproot sync-check`

```bash
taproot sync-check [--path taproot/] [--since <date>]
```

Detects staleness in two directions:
- **Code newer than spec:** a source file in `## Source Files` has been modified more recently than the `impl.md` was last verified — the implementation may have drifted from the spec
- **Spec newer than implementation:** a `usecase.md` was reviewed after the corresponding `impl.md` was completed — the implementation may not reflect the latest spec

Run this before a release or when you suspect specs have drifted from the code.

### `taproot overview`

```bash
taproot overview
```

Regenerates `taproot/OVERVIEW.md` — a compact hierarchy summary with clickable links to every intent, behaviour, and impl in the tree. The overview is the agent's entry point for orientation: agent skills read it to understand the shape of the project before drilling into individual files.

### `taproot plan`

```bash
taproot plan [--format tree|json]
```

Surfaces unimplemented behaviours as work items, ordered by priority (intents with more coverage are prioritized to reach completion). Useful for sprint planning or for orienting a new contributor. The `/tr-plan` skill provides an AI-driven version with more context.

---

## Definition of Done

### `taproot dod`

```bash
taproot dod [impl-path] [--dry-run]
taproot dod <impl-path> --resolve <condition> --note "<text>" [--resolve <condition> --note "<text>" ...]
```

Runs all configured DoD conditions from `.taproot/settings.yaml` against the specified implementation (or all implementations if no path is given). If all conditions pass and an `impl-path` is provided, marks the impl `complete`, records the results in `## DoD Resolutions`, and automatically advances the parent `usecase.md` state from `specified` to `implemented` if it hasn't been already.

Use `--resolve`/`--note` to record agent resolutions for agent-driven conditions (e.g. `document-current`, `check-if-affected`, `check-if-affected-by`). Multiple pairs can be supplied in a single invocation — conditions are paired with notes by position.

See [Configuration](configuration.md) for how to define DoD conditions.

---

## Pre-commit Hook

### `taproot commithook`

```bash
taproot commithook
```

Classifies the staged files and runs the appropriate quality gate. Installed by `taproot init --with-hooks` as the content of `.git/hooks/pre-commit` — you do not call this directly.

The hook uses a three-tier classification, where the implementation tier is detected by **reverse-lookup**: the hook walks all `impl.md` files in `taproot/` and builds a map of every source file path listed in their `## Source Files` sections. Any staged file that appears in this map triggers the implementation tier. Files not tracked by any `impl.md` (e.g. `.gitignore`, CI configs) always pass as plain commits.

| Staged files | Gate applied |
|---|---|
| Only hierarchy files (`intent.md`, `usecase.md`) | `validate-structure` + `validate-format` — hierarchy must be valid before the commit lands |
| Only `impl.md` (no source files in map) | Definition of Ready — the parent `usecase.md` must be in `specified` state and have `## Flow` and `## Related` sections |
| Source files found in map + `impl.md` staged | Verify only `## Status` (and `## DoD Resolutions`) changed in `impl.md`; then run DoD |
| Source files found in map but `impl.md` NOT staged | **Blocked** — "Stage `impl.md` alongside your source files. No implementation commit should proceed without its traceability record." |
| No tracked source files, no hierarchy or impl files | No checks; commit proceeds |

The DoR gate prevents committing an implementation record before the behaviour is fully specified. The DoD gate prevents marking an implementation complete without passing the quality checks defined in `.taproot/settings.yaml`.

---

## Commit Convention

Link commits to implementations using the conventional tag format:

```
taproot(<intent>/<behaviour>/<impl>): <message>
```

For example:
```
taproot(password-reset/request-reset/email-trigger): add rate limiting
```

Or use a commit trailer:

```
fix: handle missing user gracefully

Taproot: password-reset/request-reset/email-trigger
```

After tagging commits, run `taproot link-commits` to update the `## Commits` section of the corresponding `impl.md` automatically. The CI integration (see [Configuration](configuration.md)) can run this on every merge.
