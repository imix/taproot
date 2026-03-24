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
   b. Every path listed under `## Source Files` exists on disk — a path is identified as the first backtick-quoted token on a list item line that contains `/` or a file extension (e.g. `src/foo.ts`); backtick-quoted tokens that contain neither (function signatures, identifiers) are silently skipped and not checked
   c. Every path listed under `## Tests` exists on disk — same path-recognition rule applies: tokens are only checked if they contain `/` or a file extension
   d. Every commit hash listed under `## Commits` exists in git history
4. If `--include-unimplemented` is set, system also checks every behaviour node for the absence of any child impl folders
5. System renders all violations (errors and warnings) to stdout
6. System exits with code 0 if no errors, non-zero if any errors found

## Alternate Flows
- **No git repository**: Commit hash checks are skipped; file reference checks still run
- **`--include-unimplemented`**: Adds warnings for behaviours with no implementations — useful for completeness audits, off by default to avoid noise
- **Source Files or Tests line with no recognisable path**: A list item whose first backtick-quoted token contains neither `/` nor a file extension is silently skipped — no violation is reported. This handles description-only lines and inline code identifiers appearing before the path.

## Error Conditions
- **`BROKEN_BEHAVIOUR_REF`** (error): `impl.md` references a `usecase.md` that does not exist
- **`MISSING_SOURCE_FILE`** (error): A source file listed in `impl.md` does not exist on disk — only tokens recognised as file paths (containing `/` or a file extension) are checked; backtick-quoted identifiers without path markers are never checked and never trigger this error
- **`UNREADABLE_IMPL`** (error): `impl.md` cannot be read
- **`MISSING_TEST_FILE`** (warning): A test file listed in `impl.md` does not exist on disk
- **`COMMIT_NOT_FOUND`** (warning): A commit hash in `impl.md` is not in git history
- **`UNIMPLEMENTED_BEHAVIOUR`** (warning, opt-in): A behaviour has no implementation folders

## Postconditions
- Developers are informed of broken references before they cause downstream confusion
- CI pipeline fails fast if any `impl.md` references are structurally broken
- Orphaned specifications and dangling links are surfaced for remediation

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot check-orphans](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: No BROKEN_BEHAVIOUR_REF in a valid fixture**
- Given a hierarchy where every `impl.md` references a `usecase.md` that exists
- When the actor runs `taproot check-orphans`
- Then no violations with code `BROKEN_BEHAVIOUR_REF` are reported

**AC-2: Reports MISSING_SOURCE_FILE for source files that do not exist on disk**
- Given an `impl.md` whose `## Source Files` contains a backtick-quoted file path (a token containing `/` or a file extension) that does not exist on disk
- When the actor runs `taproot check-orphans`
- Then one or more violations with code `MISSING_SOURCE_FILE` are reported

**AC-4: Skips non-path backtick tokens in Source Files — no false MISSING_SOURCE_FILE**
- Given an `impl.md` whose `## Source Files` has a line where the first backtick-quoted token is a function signature or identifier (e.g. `` `applyVocabulary(content, vocab)` ``) containing no `/` or file extension
- When the actor runs `taproot check-orphans`
- Then no `MISSING_SOURCE_FILE` violation is reported for that line

**AC-3: Reports UNIMPLEMENTED_BEHAVIOUR when --include-unimplemented is set**
- Given a hierarchy where all behaviours have implementations
- When the actor runs `taproot check-orphans --include-unimplemented`
- Then zero violations with code `UNIMPLEMENTED_BEHAVIOUR` are reported

## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-24
