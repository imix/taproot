# Intent: Hierarchy Integrity

## Goal
Ensure the requirement hierarchy remains structurally valid and formally complete as it evolves — whether authored by humans, AI agents, or both.

## Stakeholders
- **Agentic developer / orchestrator**: needs confidence that the hierarchy AI agents read and write stays internally consistent and follows conventions
- **AI coding agents**: need a well-formed hierarchy to navigate; malformed documents cause misinterpretation
- **CI pipeline**: validates on merge to prevent malformed hierarchies entering the main branch, but never modifies content

## Success Criteria
- Structural violations (wrong nesting depth, missing marker files) are caught before commit
- Format violations (missing required sections, invalid status values) are reported with actionable messages
- The hierarchy can be validated without network access or external services
- Validation errors include enough context to fix the issue without reading the schema manually

## Constraints
- Validators read only — they never modify documents
- CI integration is read-only validation; the pipeline never writes to the hierarchy
- Validation must be fast enough to run as a git pre-commit hook without disrupting flow

## Behaviours <!-- taproot-managed -->
- [Analyse Change Impact](./analyse-change/usecase.md)
- [Pre-commit Enforcement](./pre-commit-enforcement/usecase.md)
- [Validate Format](./validate-format/usecase.md)
- [Validate Structure](./validate-structure/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
