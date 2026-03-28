# Configuration

## Quick discovery

- **In your project:** `taproot/agent/CONFIGURATION.md` — installed and refreshed by `taproot update`, documents all `settings.yaml` options with examples and whether each requires re-running `taproot update`
- **From the CLI:** `taproot --help` includes a footer pointing to `taproot/settings.yaml` and `taproot/agent/CONFIGURATION.md`
- **Full reference:** this document

## `taproot/settings.yaml`

Created by `taproot init`. All settings have defaults — you only need to add what you want to override.

```yaml
version: 1
root: taproot/

# Language pack for localising section headers, Gherkin keywords, and state values.
# Supported codes: de, fr, es, ja, pt (omit for English).
# Applied at `taproot update` time — skill files and agent adapters are regenerated
# with translated structural vocabulary. Validators and the commit hook also accept
# the localised section names when this is set.
language: de

# Domain vocabulary overrides — replace dev-specific terms with domain-appropriate equivalents.
# Applied as a second pass after the language pack. Re-applied on each `taproot update`.
vocabulary:
  tests: manuscript reviews
  source files: chapters
  build: compile draft

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
| `tests-passing` | Built-in: runs `npm test`. When `testsCommand` is configured in `settings.yaml`, uses evidence-backed execution with a cache file — see [State Transition Guardrails](#state-transition-guardrails). |
| `linter-clean` | Built-in: runs `npm run lint`. Passes if exit code is 0. |
| `commit-conventions` | Built-in: runs `npm run check:commits`. Passes if exit code is 0. |
| `document-current: <description>` | Agent-verified: the agent checks whether the described documentation is current and applies updates if needed. |
| `check-if-affected: <file>` | Agent-verified: the agent reviews whether the given file needed updating as a result of this implementation and applies changes if needed. |
| `check-if-affected-by: <behaviour-path>` | Agent-verified: the agent reads the referenced behaviour spec and determines whether it applies to this implementation — verifying compliance if it does, recording "not applicable" if it does not. Use for cross-cutting requirements that every implementation of a given type must satisfy (e.g. every new skill must satisfy `human-integration/contextual-next-steps`). |
| `check: <free-form question>` | Agent-verified: the agent reads the question, reasons whether the answer is yes, no, or not applicable for this specific implementation, and takes any indicated action (e.g. adds an entry to `taproot/settings.yaml`, documents a new pattern). The two default entries in `taproot/settings.yaml` cover the most common meta-questions. |
| `run: <command>` | Custom shell command. Exit 0 = pass, any other exit code = fail. |

### Scoping conditions with `when:`

Any condition can be scoped to run only when the implementation's `## Source Files` list contains a file matching a glob pattern:

```yaml
definitionOfDone:
  - check-if-affected-by: skill-architecture/context-engineering
    when:
      source-matches: "skills/*.md"
  - check-if-affected-by: api-design/rest-conventions
    when:
      source-matches: "src/api/**/*.ts"
```

When `taproot dod` runs for an impl:

- If any source file path listed in `## Source Files` matches the glob → the condition runs normally.
- If no source file matches → the condition is auto-resolved as `not applicable — no source files match \`<glob>\`` without requiring agent work.
- If the impl has no `## Source Files` section → all scoped conditions are auto-resolved as `not applicable — impl has no ## Source Files section`.

Glob syntax: `*` matches any characters except `/`; `**` matches across directory separators. A malformed `when:` qualifier (any key other than `source-matches`) produces a parse error result for that condition.

The primary use case is conditions that apply only to a specific implementation type — e.g. skill files, API handlers, CLI commands — to avoid repetitive "not applicable" resolutions across all other impls.

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

### Built-in cross-cutting DoD conditions

Taproot's own `taproot/settings.yaml` ships with several `check-if-affected-by` conditions that enforce project-wide quality rules. These serve as reference examples:

| Condition | What it enforces |
|-----------|-----------------|
| `check-if-affected-by: agent-integration/agent-agnostic-language` | Shared skill/spec files use generic agent language — no implicit Claude assumptions, no `@{project-root}` syntax outside adapter files |
| `check-if-affected-by: human-integration/contextual-next-steps` | Every skill that produces output ends with a **What's next?** block |
| `check-if-affected-by: human-integration/pause-and-confirm` | Skills that write multiple documents pause for developer confirmation between each |
| `check-if-affected-by: skill-architecture/context-engineering` | Skill files meet context-efficiency constraints |
| `check-if-affected-by: skill-architecture/commit-awareness` | Skills with git commit steps load the full commit skill rather than inventing ad-hoc git flows |
| `check-if-affected-by: human-integration/pattern-hints` | Skills that receive natural language intent check `docs/patterns.md` for pattern matches |
| `check-if-affected-by: quality-gates/architecture-compliance` | Implementations comply with `docs/architecture.md` constraints |

---

## Autonomous Execution

Setting `autonomous: true` in `settings.yaml` (or `TAPROOT_AUTONOMOUS=1` / `--autonomous` per invocation) puts all agent skills into non-interactive mode.

```yaml
autonomous: true   # all sessions in this repo run without confirmation prompts
```

**What autonomous mode changes:**
- `/tr-implement` proceeds from plan to code without pausing for plan approval
- `/tr-commit` stages and commits without asking for confirmation when nothing is pre-staged
- DoD conditions are self-evaluated: resolvable conditions are recorded directly; unresolvable `check:` questions are marked `<!-- autonomous: pending-review -->` in `impl.md`
- Test failures or hook rejections are recorded in `impl.md` (impl marked `needs-rework`) and the agent stops — the developer returns to a clear failure report

**Three activation mechanisms (in order of scope):**
1. `autonomous: true` in `taproot/settings.yaml` — repo-wide, all sessions
2. `TAPROOT_AUTONOMOUS=1` environment variable — per process invocation
3. `--autonomous` flag on a skill invocation (e.g. `/tr-implement path/ --autonomous`) — per skill

When none of these is set, confirmation prompts are shown as normal. Autonomous mode is never inferred from context.

---

## State Transition Guardrails

When `testsCommand` is set in `settings.yaml`, the `tests-passing` condition uses evidence-backed execution: it runs the command, caches the result in `.taproot/.test-results/`, and enforces freshness at commit time.

```yaml
testsCommand: npm test        # command to run for evidence-backed tests-passing
testResultMaxAge: 60          # minutes before a no-source-file cache is stale (default: 60)
testTimeout: 300              # seconds before testsCommand is killed (default: 300)
```

**How it works:**
- `taproot dod <impl-path>` runs `testsCommand`, streams output live, and writes `.taproot/.test-results/<intent>/<behaviour>/<impl>.json`
- On subsequent runs, the cached result is used if it is not stale (no tracked source files changed since the last run)
- `taproot dod <impl-path> --rerun-tests` forces re-execution regardless of cache
- `--resolve "tests-passing"` is rejected when `testsCommand` is configured — evidence is required, not agent assertion
- The pre-commit hook verifies a fresh passing result exists before allowing an implementation commit with a `complete` impl

**Add `.taproot/.test-results/` to `.gitignore`** — the cache is a local execution artifact, not a committed record.

---

## Definition of Ready

The `definitionOfReady` list controls what the pre-commit hook checks when you make a declaration commit (committing `impl.md` without source files). All conditions must pass before the declaration commit is accepted.

### Condition syntax

The `definitionOfReady` conditions use the same syntax as `definitionOfDone` — bare built-in names, `run:` shell commands, `check:` agent questions, and `check-if-affected-by:` behaviour spec references. The baseline checks (usecase exists, state=specified, Flow diagram, Related section) always run regardless of what's configured here.

### `check-if-affected-by:` at DoR time

Use `check-if-affected-by` in `definitionOfReady` to enforce pre-implementation architecture compliance. The agent reads the referenced behaviour spec and determines whether the proposed implementation's design decisions comply before any code is written.

Two built-in gates ship with taproot's default configuration:

```yaml
definitionOfReady:
  - check-if-affected-by: quality-gates/architecture-compliance
  - check-if-affected-by: quality-gates/nfr-measurability
```

**`quality-gates/architecture-compliance`** — requires every `impl.md` declaration to be checked against `docs/architecture.md` before implementation begins. See `docs/architecture.md` for the project's architectural decisions and constraints.

**`quality-gates/nfr-measurability`** — requires every `impl.md` declaration to verify that all `**NFR-N:**` entries in the parent `usecase.md` have measurable `Then` clauses (number+unit, named standard, or testable boolean). Vague qualifiers ("fast", "secure", "reasonable") block the declaration commit. If the `usecase.md` has no `**NFR-N:**` entries, the check passes as not applicable.

### `check:` at DoR time

When a `check:` condition is present in `definitionOfReady`, the agent reasons about the question before making the declaration commit. The resolution is written directly into the new `impl.md` under `## DoR Resolutions`:

```markdown
## DoR Resolutions
- condition: check: is this spec complete enough? | note: yes, all flows are specified | resolved: 2026-03-20T10:00:00.000Z
```

### `require-discussion-log`

Require a `discussion.md` alongside every `impl.md` at declaration commit time. Off by default — enable for teams that want to enforce the record-decision-rationale habit:

```yaml
definitionOfReady:
  - require-discussion-log: true
```

When enabled, the pre-commit hook checks whether `discussion.md` exists in the impl folder before accepting the declaration commit. If missing, the commit is rejected with the expected file path. The check is existence-only — content quality is not verified by the hook.

See `taproot/requirements-compliance/record-decision-rationale/` for what `discussion.md` should contain and how the agent writes it.

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

## Language

### `language`

Set to a BCP-47 language code to localise taproot's structural vocabulary for non-English teams.

```yaml
language: de   # German
```

**Supported codes:** `de` (German), `fr` (French), `es` (Spanish), `ja` (Japanese), `pt` (Portuguese). Omit the field entirely for English (default).

**What gets localised:**

| Element | Example (de) |
|---------|-------------|
| Section headers in skill files | `## Actor` → `## Akteur` |
| Gherkin keywords | `Given / When / Then` → `Gegeben / Wenn / Dann` |
| State values | `specified / complete` → `spezifiziert / vollständig` |

Localisation is applied at **`taproot update`** time — skill files and agent adapter files are regenerated with the translated vocabulary. The `validate-format` command and the pre-commit commit hook also accept the localised section names when `language` is set, so German (or French, etc.) usecase.md files pass validation without needing English headers.

`impl.md` traceability fields (`## Behaviour`, `## Commits`, `## Tests`) are intentionally kept in English — they are structural links, not prose, and must remain machine-readable regardless of language setting.

**Unknown language code:** `taproot update` will abort with an error listing the supported codes and make no file changes.

---

## Vocabulary

### `vocabulary`

Replace dev-specific terms in installed skill files with domain-appropriate equivalents. Useful for non-development projects (book authoring, financial reporting, legal review) where terms like "tests", "source files", or "build" don't map to project reality.

```yaml
vocabulary:
  tests: manuscript reviews
  source files: chapters
  build: compile draft
  implementation: writing
```

Applied as a second substitution pass after the language pack (if any). Re-applied on each `taproot update` run, so overrides survive skill upgrades.

**Substitution semantics:**

- **Declaration-order**: keys are processed in the order they appear in `settings.yaml`. Once a token is substituted, the result is not re-scanned — this prevents chained substitution.
- **Case-sensitive**: `tests` matches `tests` but not `Tests` or `TESTS`. Use multiple keys if case variants need covering.
- **Structural keywords protected**: keys matching section headers, Gherkin keywords, or state values (from the active language pack, or English defaults) are skipped with a warning. This prevents accidentally overriding structural vocabulary that validators depend on.

**Error conditions:**

- If any vocabulary key maps to an empty string, `taproot update` aborts with an error message and makes no file changes.
- If a vocabulary key conflicts with a structural keyword, `taproot update` logs a warning for that key, skips it, and applies all non-conflicting overrides.

---

## CLI invocation

### `cli`

Controls which command agents use when executing taproot CLI steps (e.g. `taproot dod`, `taproot link-commits`). The value is injected into agent adapter files as a machine-readable block — agents read it at session start and substitute it wherever a skill step says `taproot <subcommand>`.

```yaml
cli: taproot
```

**Default:** `npx @imix-js/taproot` — works in any environment, whether or not taproot is globally installed.

**Common overrides:**
- `cli: taproot` — globally installed (`npm install -g @imix-js/taproot`)
- `cli: ./node_modules/.bin/taproot` — local `devDependency`

**Requires `taproot update`:** yes — the invocation block in agent adapter files is regenerated.

---

## Validation settings

### `require_dates`

When `true`, `validate-format` requires a `Created:` date in `intent.md` and `impl.md`. Useful for auditing when features were introduced. Disable in projects where historical intents were backfilled without dates.

### `require_status`

When `true`, all marker files must have a `## Status` section. Disable during initial migration of a large codebase where some documents are incomplete.

### State lists

The `allowed_*_states` lists control what values are accepted in the `State:` field of each document type. You can add custom states if your workflow requires them (e.g., `approved` between `specified` and `implemented`), but the pre-commit hook's DoR gate always checks for `specified` specifically before allowing a declaration commit — custom intermediate states will block the hook unless you adjust the DoR configuration.
