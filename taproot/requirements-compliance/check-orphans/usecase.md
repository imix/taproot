# UseCase: Check for Orphaned or Broken References

## Actor
Developer or CI pipeline running `taproot check-orphans`

## Preconditions
- A taproot hierarchy exists with one or more `impl.md` files

## Main Flow
1. Developer runs `taproot check-orphans` (optionally with `--include-unimplemented`)
2. System walks the hierarchy and collects all impl and behaviour nodes
3. For each `impl.md`, system checks:
   a. The `## Behaviour` reference resolves to an existing `usecase.md`
   b. Every path listed under `## Source Files` exists on disk
   c. Every path listed under `## Tests` exists on disk
   d. Every commit hash listed under `## Commits` exists in git history
4. If `--include-unimplemented` is set, system also checks every behaviour node for the absence of any child impl folders
5. System renders all violations (errors and warnings) to stdout
6. System exits with code 0 if no errors, non-zero if any errors found

## Alternate Flows
- **No git repository**: Commit hash checks are skipped; file reference checks still run
- **`--include-unimplemented`**: Adds warnings for behaviours with no implementations — useful for completeness audits, off by default to avoid noise

## Error Conditions
- **`BROKEN_BEHAVIOUR_REF`** (error): `impl.md` references a `usecase.md` that does not exist
- **`MISSING_SOURCE_FILE`** (error): A source file listed in `impl.md` does not exist on disk
- **`UNREADABLE_IMPL`** (error): `impl.md` cannot be read
- **`MISSING_TEST_FILE`** (warning): A test file listed in `impl.md` does not exist on disk
- **`COMMIT_NOT_FOUND`** (warning): A commit hash in `impl.md` is not in git history
- **`UNIMPLEMENTED_BEHAVIOUR`** (warning, opt-in): A behaviour has no implementation folders

## Postconditions
- Developers are informed of broken references before they cause downstream confusion
- CI pipeline fails fast if any `impl.md` references are structurally broken
- Orphaned specifications and dangling links are surfaced for remediation

## Status
- **State:** implemented
- **Created:** 2026-03-19
