# Configuration

## `.taproot.yaml`

Created by `taproot init`. All settings have defaults — you only need to add what you want to override.

```yaml
version: 1
root: taproot/

# Commit message format for linking commits to impl.md records.
# The default matches: taproot(path/to/impl): message
commit_pattern: "taproot\\(([^)]+)\\):"
commit_trailer: "Taproot"

# Which agent adapters to keep current when running taproot update.
# Adapters not in this list are not regenerated on update.
agents: [claude, cursor, generic]

# Validation strictness — controls what validate-format accepts.
validation:
  require_dates: true           # intent.md and impl.md must have Created: dates
  require_status: true          # all marker files must have a ## Status section
  allowed_intent_states: [draft, active, achieved, deprecated]
  allowed_behaviour_states: [proposed, specified, implemented, tested, deprecated, deferred]
  allowed_impl_states: [planned, in-progress, complete, needs-rework, deferred]

# Definition of Done — conditions checked before taproot dod marks an impl complete.
definitionOfDone:
  - tests-passing
  - linter-clean
  - document-current: ensure all sections in readme.md are up to date
  - run: npm run check:commits
    name: commit-conventions
```

---

## Definition of Done

The `definitionOfDone` list controls what `taproot dod` checks and what the pre-commit hook enforces when you commit source code alongside an `impl.md`. Each condition must pass before an implementation can be marked `complete`.

### Condition syntax

| Form | What it does |
|------|-------------|
| `tests-passing` | Built-in: runs `npm test` (or `yarn test`). Passes if exit code is 0. |
| `linter-clean` | Built-in: runs `npm run lint`. Passes if exit code is 0. |
| `commit-conventions` | Built-in: runs `npm run check:commits`. Passes if exit code is 0. |
| `document-current: <description>` | Agent-verified: the agent checks whether the described documentation is current and applies updates if needed. |
| `check-if-affected: <file>` | Agent-verified: the agent reviews whether the given file needed updating as a result of this implementation and applies changes if needed. |
| `check-if-affected-by: <behaviour-path>` | Agent-verified: the agent reads the referenced behaviour spec and determines whether it applies to this implementation — verifying compliance if it does, recording "not applicable" if it does not. Use for cross-cutting requirements that every implementation of a given type must satisfy (e.g. every new skill must satisfy `human-integration/contextual-next-steps`). |
| `check: <free-form question>` | Agent-verified: the agent reads the question, reasons whether the answer is yes, no, or not applicable for this specific implementation, and takes any indicated action (e.g. adds an entry to `.taproot.yaml`, documents a new pattern). The two default entries in `.taproot.yaml` cover the most common meta-questions. |
| `run: <command>` | Custom shell command. Exit 0 = pass, any other exit code = fail. |

You can give any condition a custom name with `name: <label>`, which is used in DoD reports:

```yaml
definitionOfDone:
  - run: ./scripts/check-migrations.sh
    name: migration-safety
```

### When DoD runs

DoD runs in two places:

1. **`taproot dod [impl-path]`** — manually, or in CI. Pass an `impl-path` to mark the impl `complete` if all conditions pass; omit it to check all impls without writing changes.
2. **Pre-commit hook (implementation tier)** — when you commit source files alongside an `impl.md`. The hook checks DoD in dry-run mode; if any condition fails, the commit is blocked.

Results are recorded in the `## DoD Resolutions` section of `impl.md`. The section is maintained by `taproot dod` — do not edit it manually.

---

## Definition of Ready

The `definitionOfReady` list controls what the pre-commit hook checks when you make a declaration commit (committing `impl.md` without source files). All conditions must pass before the declaration commit is accepted.

### Condition syntax

The `definitionOfReady` conditions use the same syntax as `definitionOfDone` — bare built-in names, `run:` shell commands, `check:` agent questions, and `check-if-affected-by:` behaviour spec references. The baseline checks (usecase exists, state=specified, Flow diagram, Related section) always run regardless of what's configured here.

### `check-if-affected-by:` at DoR time

Use `check-if-affected-by` in `definitionOfReady` to enforce pre-implementation architecture compliance. The agent reads the referenced behaviour spec and determines whether the proposed implementation's design decisions comply before any code is written.

The canonical use case is architecture compliance:

```yaml
definitionOfReady:
  - check-if-affected-by: implementation-quality/architecture-compliance
```

This requires every `impl.md` declaration to be checked against `docs/architecture.md` before implementation begins. See `docs/architecture.md` for the project's architectural decisions and constraints.

### `check:` at DoR time

When a `check:` condition is present in `definitionOfReady`, the agent reasons about the question before making the declaration commit. The resolution is written directly into the new `impl.md` under `## DoR Resolutions`:

```markdown
## DoR Resolutions
- condition: check: is this spec complete enough? | note: yes, all flows are specified | resolved: 2026-03-20T10:00:00.000Z
```

### When DoR runs

DoR runs once: when the declaration commit is made (committing `impl.md` alone, before any source code). It is enforced by the pre-commit hook's declaration tier.

---

## CI Integration

Taproot validation runs fast (seconds) and has no external dependencies beyond Node. Adding it to CI ensures the hierarchy stays valid on every merge.

### GitHub Actions

```bash
taproot init --with-ci github
```

Generates `.github/workflows/taproot.yml` that runs on every PR and push to main:

```yaml
- run: taproot validate-structure
- run: taproot validate-format
- run: taproot check-orphans
```

### GitLab CI

```bash
taproot init --with-ci gitlab
```

Generates a `taproot-validate` job in `.gitlab-ci.yml`. If `.gitlab-ci.yml` already exists, the job is appended — existing CI is not modified.

### Keeping CONTEXT.md current on merge

`taproot/CONTEXT.md` is a compact hierarchy summary for agent consumption (generated by `taproot coverage --format context`). If your agents use it for project orientation, keep it current by adding this to your post-merge pipeline:

```bash
taproot link-commits
taproot coverage --format context
git add taproot/CONTEXT.md && git commit -m "chore: update taproot context" || true
```

---

## Validation settings

### `require_dates`

When `true`, `validate-format` requires a `Created:` date in `intent.md` and `impl.md`. Useful for auditing when features were introduced. Disable in projects where historical intents were backfilled without dates.

### `require_status`

When `true`, all marker files must have a `## Status` section. Disable during initial migration of a large codebase where some documents are incomplete.

### State lists

The `allowed_*_states` lists control what values are accepted in the `State:` field of each document type. You can add custom states if your workflow requires them (e.g., `approved` between `specified` and `implemented`), but the pre-commit hook's DoR gate always checks for `specified` specifically before allowing a declaration commit — custom intermediate states will block the hook unless you adjust the DoR configuration.
