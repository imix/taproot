# UseCase: Generate Human-Readable Status Report

## Actor
Developer or project stakeholder invoking `/tr-status`

## Preconditions
- A taproot hierarchy exists with at least one intent

## Main Flow
1. Developer invokes `/tr-status`
2. Agent runs `taproot coverage --format json` and parses the completeness data
3. Agent runs `taproot check-orphans --include-unimplemented` and collects structural violations
4. Agent runs `taproot sync-check` and collects staleness warnings
5. Agent runs `taproot validate-structure` and `taproot validate-format` to check for schema errors
6. Agent synthesizes all results into a structured narrative report:
   - **Validation**: pass/fail for structure and format
   - **Coverage**: counts and progress bars for intents, behaviours, implementations
   - **What's Working**: intents and behaviours that are fully implemented and tested
   - **What Needs Attention**: unimplemented behaviours, missing tests, stale specs — prioritized by severity
   - **Structural Issues**: broken references from `check-orphans`
   - **Suggested Next Actions**: actionable, prioritized list linking to relevant skills
7. Agent presents the report as a narrative in the conversation

## Alternate Flows
- **`--path <subpath>`**: Scopes all commands to a subtree of the hierarchy
- **No issues found**: Agent presents a clean health summary with a suggestion to run `/tr-grill-all` for deeper semantic review

## Error Conditions
- **Validation errors present**: Agent flags these as top priority before presenting the rest of the report — broken structure/format must be fixed before other metrics are meaningful

## Postconditions
- Developer has a single consolidated view of hierarchy health without running multiple commands
- Actionable next steps are surfaced and linked to the skills that address them
- Project stakeholders can understand progress without reading individual taproot documents

## Implementations <!-- taproot-managed -->
- [Agent Skill — /tr-status](./agent-skill/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19
