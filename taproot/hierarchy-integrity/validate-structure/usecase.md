# UseCase: Validate Structure

## Actor
Agentic developer / orchestrator, AI coding agent, or CI pipeline verifying the hierarchy is well-formed

## Preconditions
- `taproot/` directory exists
- `.taproot.yaml` is present or defaults are used

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


## Status
- **State:** implemented
- **Created:** 2026-03-19
