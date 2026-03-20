# UseCase: Validate Structure

## Actor
Agentic developer / orchestrator, AI coding agent, or CI pipeline verifying the hierarchy is well-formed

## Preconditions
- `taproot/` directory exists
- `.taproot/settings.yaml` is present or defaults are used

## Main Flow
1. Actor runs `taproot validate-structure`
2. System walks the `taproot/` directory tree, skipping `_brainstorms/`, `skills/`, and other reserved folders
3. System checks each folder against the nesting rules: intent folders at depth 1, behaviour folders at depth 2+, implementation folders as leaves
4. System checks that each folder contains exactly one marker file (`intent.md`, `usecase.md`, or `impl.md`) — not zero, not multiple
5. System checks that marker file types are consistent with their depth (e.g. `impl.md` cannot appear at intent depth)
6. System prints a violation report with file paths and error codes, or confirms the hierarchy is valid
7. System exits with code 0 (valid) or 1 (violations found)

## Alternate Flows
- **`--strict` flag**: additionally warns on empty folders (no children) and folders with no marker file but with descendants — surface orphaned structure
- **`--path <path>`**: validate a subtree rather than the whole hierarchy

## Error Conditions
- **Unreadable directory**: skipped with a warning; remaining folders are still validated
- **Multiple marker files in one folder**: reported as a violation with all conflicting files listed

## Postconditions
- Caller knows whether the hierarchy is structurally valid
- Each violation includes: severity (error/warning), file path, error code, human-readable message

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot validate-structure](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: No errors for a complete valid hierarchy**
- Given a well-formed hierarchy with correctly nested intent, behaviour, and impl folders
- When the actor runs `taproot validate-structure`
- Then no errors are reported

**AC-2: IMPL_PARENT_INVALID when impl.md is directly under an intent**
- Given a hierarchy where an `impl.md` is placed directly under an intent folder (skipping the behaviour level)
- When the actor runs `taproot validate-structure`
- Then a violation with code `IMPL_PARENT_INVALID` is reported

**AC-3: DUPLICATE_MARKERS when folder has both intent.md and usecase.md**
- Given a folder containing both `intent.md` and `usecase.md`
- When the actor runs `taproot validate-structure`
- Then a violation with code `DUPLICATE_MARKERS` is reported

**AC-4: INVALID_FOLDER_NAME for non-kebab-case folder names**
- Given a folder whose name contains uppercase letters or underscores
- When the actor runs `taproot validate-structure`
- Then a violation with code `INVALID_FOLDER_NAME` is reported

**AC-5: ORPHAN_FOLDER for empty folders with no descendants**
- Given a folder that has no marker file and no child folders
- When the actor runs `taproot validate-structure`
- Then a violation with code `ORPHAN_FOLDER` is reported

**AC-6: Strict mode runs without crashing**
- Given a valid hierarchy
- When the actor runs `taproot validate-structure --strict`
- Then the command completes and returns an array of violations (may be empty)

## Status
- **State:** implemented
- **Created:** 2026-03-19
