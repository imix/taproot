# UseCase: Validate Format

## Actor
Agentic developer / orchestrator, AI coding agent, or CI pipeline verifying document contents conform to the schema

## Preconditions
- `taproot/` directory exists with at least one marker file
- Structure validation has passed (format validation assumes structurally valid input)

## Main Flow
1. Actor runs `taproot validate-format`
2. System walks the hierarchy and collects all marker files (`intent.md`, `usecase.md`, `impl.md`)
3. For each marker file, system parses the markdown into sections
4. System validates the sections against the schema for that document type:
   - `intent.md`: requires Goal, Stakeholders, Success Criteria, Status
   - `usecase.md`: requires Actor, Preconditions, Main Flow, Postconditions, Status
   - `impl.md`: requires Behaviour, Commits, Tests, Status
5. System checks that Status fields contain allowed state values (from `.taproot.yaml` config)
6. System checks that date fields are present if `require_dates` is enabled
7. System prints violations with file path, line number where available, and error code
8. System exits with code 0 (valid) or 1 (violations found)

## Alternate Flows
- **`--fix` flag**: for each `MISSING_SECTION` violation, system appends the missing section header with a placeholder value, then re-validates; remaining violations are still reported
- **`--path <path>`**: validate a subtree only

## Error Conditions
- **Unreadable file**: reported as `UNREADABLE_FILE` error; remaining files are still validated
- **Invalid state value**: reported as a violation with the allowed values listed

## Postconditions
- Caller knows whether all documents conform to the schema
- With `--fix`, missing sections are scaffolded so the document can be completed without starting from scratch

## Status
- **State:** implemented
- **Created:** 2026-03-19
