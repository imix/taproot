# Configuration

## `.taproot.yaml`

```yaml
version: 1
root: taproot/

# Commit message format for linking
commit_pattern: "taproot\\(([^)]+)\\):"
commit_trailer: "Taproot"

# Agent adapters to generate
agents: [claude, cursor, generic]

# Validation strictness
validation:
  require_dates: true
  require_status: true
  allowed_intent_states: [draft, active, achieved, deprecated]
  allowed_behaviour_states: [proposed, specified, implemented, tested, deprecated]
  allowed_impl_states: [planned, in-progress, complete, needs-rework]

# Definition of Done — checked before marking an impl complete
definitionOfDone:
  - tests-passing
  - linter-clean
  - document-current: ensure all sections in readme.md are up to date
  - run: npm run check:commits
    name: commit-conventions
```

### DoD condition syntax

| Form | Meaning |
|------|---------|
| `tests-passing` | Built-in: runs `npm test` |
| `linter-clean` | Built-in: runs `npm run lint` |
| `commit-conventions` | Built-in: runs `npm run check:commits` |
| `document-current: <description>` | Manual/agent-verified: surfaces description as correction context |
| `run: <command>` | Custom shell command; exit 0 = pass |

## CI Integration

### GitHub Actions

```bash
taproot init --with-ci github
```

Generates `.github/workflows/taproot.yml` that runs on every PR:
- `taproot validate-structure`
- `taproot validate-format`
- `taproot check-orphans`

### GitLab CI

```bash
taproot init --with-ci gitlab
```

Generates a `taproot-validate` job in `.gitlab-ci.yml`.

### Keep CONTEXT.md current on merge

Add to your post-merge pipeline:

```bash
taproot link-commits
taproot coverage --format context
```
