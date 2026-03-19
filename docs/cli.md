# CLI Reference

## Setup

```bash
taproot init [--with-hooks] [--with-ci github|gitlab] [--with-skills] [--agent claude|cursor|copilot|windsurf|generic|all]
```

| Option | Effect |
|--------|--------|
| `--with-hooks` | Installs git pre-commit hook running structure and format validation |
| `--with-ci github` | Generates `.github/workflows/taproot.yml` |
| `--with-ci gitlab` | Generates `.gitlab-ci.yml` taproot validation job |
| `--with-skills` | Copies skill definitions to `taproot/skills/` |
| `--agent <name>` | Generates agent adapter files |

```bash
taproot update
```
Refresh installed agent adapters and skills to the current version. Removes stale artefacts from older layouts.

## Validation

```bash
taproot validate-structure [--path taproot/] [--strict]
```
Verify folder hierarchy nesting rules. Exit 0 if valid, exit 1 with violations.

```bash
taproot validate-format [--path taproot/] [--fix]
```
Validate marker files conform to their schemas. `--fix` scaffolds missing section headers.

## Traceability

```bash
taproot link-commits [--since <date|hash>] [--dry-run]
```
Scan git log for `taproot(<path>): message` commits and link them to `impl.md` records.

```bash
taproot check-orphans [--include-unimplemented]
```
Find broken references: missing source files, invalid behaviour refs, commits not in git history.

## Reporting

```bash
taproot coverage [--format tree|json|markdown|context]
```
Completeness summary. `--format context` writes `taproot/CONTEXT.md` for agent consumption.

```bash
taproot sync-check [--since <date>]
```
Detect staleness: source files modified after `impl.md`, spec updated after implementations.

```bash
taproot overview
```
Regenerate `taproot/OVERVIEW.md` — a compact hierarchy summary for agent orientation.

```bash
taproot plan [--format tree|json]
```
Surface unimplemented behaviours as AFK or HITL work items, ordered by priority.

## Definition of Done

```bash
taproot dod [impl-path]
```
Run all configured DoD conditions from `.taproot.yaml`. With `impl-path`, marks the impl `complete` if all pass.

## Commit Convention

Link commits to implementations:

```
taproot(<intent>/<behaviour>/<impl>): <message>
```

Or use a trailer:
```
fix: handle missing user gracefully

Taproot: password-reset/request-reset/email-trigger
```

Then run `taproot link-commits` to update `impl.md` automatically.
