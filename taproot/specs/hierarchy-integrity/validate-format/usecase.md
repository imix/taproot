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
   - `usecase.md`: requires Actor, Preconditions, Main Flow, Postconditions, Status, Flow (Mermaid diagram), Related (links to related behaviours)
   - `impl.md`: requires Behaviour, Commits, Tests, Status
5. System checks that Status fields contain allowed state values (from `.taproot/settings.yaml` config)
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

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot validate-format](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Valid documents report no errors**
- Given a hierarchy with valid intent.md, usecase.md, and impl.md documents
- When the actor runs `taproot validate-format`
- Then no schema errors are reported

**AC-2: MISSING_SECTION detected for missing required sections**
- Given an intent.md missing `## Stakeholders` and `## Success Criteria`
- When the actor runs `taproot validate-format`
- Then violations with code `MISSING_SECTION` are reported, one per missing section

**AC-3: INVALID_STATUS_VALUE detected for unknown state**
- Given a document whose `## Status` section contains an unknown state value
- When the actor runs `taproot validate-format`
- Then a violation with code `INVALID_STATUS_VALUE` is reported

**AC-4: INVALID_DATE_FORMAT detected for non-ISO dates**
- Given a document with a date field that is not in ISO format
- When the actor runs `taproot validate-format`
- Then a violation with code `INVALID_DATE_FORMAT` is reported

**AC-5: --fix adds missing section headers without destroying existing content**
- Given an intent.md missing `## Stakeholders` and `## Success Criteria`
- When the actor runs `taproot validate-format --fix`
- Then both missing section headers are appended to the file and existing content (e.g. `## Goal`) is preserved unchanged

**AC-6: MISSING_ACCEPTANCE_CRITERIA warning when impl child exists but section absent**
- Given a usecase.md with at least one child impl folder but no `## Acceptance Criteria` section
- When the actor runs `taproot validate-format`
- Then a `MISSING_ACCEPTANCE_CRITERIA` warning is reported for that usecase.md

**AC-7: No warning for usecase with no impl children**
- Given a usecase.md with no child impl folders and no `## Acceptance Criteria` section
- When the actor runs `taproot validate-format`
- Then no `MISSING_ACCEPTANCE_CRITERIA` warning is reported

**AC-8: DUPLICATE_CRITERION_ID error when same AC-N appears twice**
- Given a usecase.md where the same AC-N ID appears in two separate criterion headings
- When the actor runs `taproot validate-format`
- Then a `DUPLICATE_CRITERION_ID` error is reported, identifying the duplicate ID

## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19
