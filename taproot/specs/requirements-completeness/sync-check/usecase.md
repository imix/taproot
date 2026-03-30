# UseCase: Detect Stale Specifications

## Actor
Developer or CI pipeline running `taproot sync-check`

## Preconditions
- A taproot hierarchy exists with one or more `impl.md` files referencing source or test files

## Main Flow
1. Developer runs `taproot sync-check`
2. System walks the hierarchy and processes each impl and behaviour node
3. For each `impl.md`:
   a. System determines the last-modified timestamp of `impl.md` itself (preferring git commit date, falling back to filesystem mtime)
   b. For each source file and test file listed in the `impl.md`, system checks whether the file's last-modified timestamp is newer than `impl.md`'s
   c. If a referenced file is newer, system emits a warning: the implementation record may be stale
4. For each `usecase.md` with child implementations:
   a. System checks whether `usecase.md` was modified more recently than any of its child `impl.md` files
   b. If so, system emits a warning: the spec changed after the implementation was recorded, and the implementation may not reflect the current spec
5. System renders all warnings (warnings only, not errors) and completes successfully

## Alternate Flows
- **`--since <date>`**: Only consider file changes after the given date
- **No git repository**: System falls back to filesystem mtime for all comparisons
- **Referenced file does not exist on disk**: File is skipped (missing file errors are `check-orphans`' domain)

## Error Conditions
- **`IMPL_STALE`** (warning): A source or test file was committed/modified after `impl.md` — the implementation record may not describe the current code
- **`SPEC_UPDATED`** (warning): `usecase.md` was updated after `impl.md` — the implementation may not reflect the current specification

## Postconditions
- Developer is alerted to specifications or implementation records that may be out of sync with the current code
- Teams can use this as a prompt to run `/tr-refine` to bring the spec back into alignment with what was built

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot sync-check](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Runs without error on a valid hierarchy**
- Given a valid hierarchy
- When the actor runs `taproot sync-check`
- Then the command completes and returns an array (may be empty)

**AC-2: Returns only warnings, never errors**
- Given any hierarchy
- When the actor runs `taproot sync-check`
- Then no violations with `type: error` are returned — all violations are warnings

**AC-3: Only IMPL_STALE and SPEC_UPDATED violation codes are used**
- Given any hierarchy that produces violations
- When the actor runs `taproot sync-check`
- Then every violation code is either `IMPL_STALE` or `SPEC_UPDATED`

## Status
- **State:** implemented
- **Created:** 2026-03-19
