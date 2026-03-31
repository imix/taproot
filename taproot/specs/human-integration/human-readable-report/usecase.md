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
6. Agent reads `taproot/backlog.md` if it exists — counts items and extracts the first 3 for the summary
7. Agent reads `taproot/plan.md` if it exists — counts pending vs complete items and identifies the next pending item
8. Agent synthesizes all results into a structured narrative report:
   - **Validation**: pass/fail for structure and format
   - **Coverage**: counts and progress bars for intents, behaviours, implementations
   - **What's Working**: intents and behaviours that are fully implemented and tested
   - **What Needs Attention**: unimplemented behaviours, missing tests, stale specs — prioritized by severity
   - **Parked**: deferred behaviours and implementations — sourced from `deferredBehaviours` / `deferredImpls` in coverage JSON; each item shown with its reason if present; omitted entirely if no deferred items exist; not counted as errors or gaps
   - **Structural Issues**: broken references from `check-orphans`
   - **Backlog**: total item count and first 3 items from `taproot/backlog.md`; omitted if file is absent or empty
   - **Plan**: pending and complete item counts plus the next pending item title from `taproot/plan.md`; omitted if file is absent
   - **Suggested Next Actions**: actionable, prioritized list linking to relevant skills
9. Agent presents the report as a narrative in the conversation

## Alternate Flows
- **`--path <subpath>`**: Scopes all commands to a subtree of the hierarchy
- **No issues found**: Agent presents a clean health summary with a suggestion to run `/tr-review-all` for deeper semantic review
- **No deferred items**: Parked section is omitted from the report entirely
- **No backlog.md or empty backlog**: Backlog section is omitted from the report
- **No plan.md**: Plan section is omitted from the report

## Error Conditions
- **Validation errors present**: Agent flags these as top priority before presenting the rest of the report — broken structure/format must be fixed before other metrics are meaningful

## Postconditions
- Developer has a single consolidated view of hierarchy health without running multiple commands
- Actionable next steps are surfaced and linked to the skills that address them
- Project stakeholders can understand progress without reading individual taproot documents

## Acceptance Criteria

**AC-1: Deferred items appear in Parked section, not in errors**
- Given `taproot coverage --format json` returns `deferredBehaviours > 0` or `deferredImpls > 0`
- When `tr-status` runs
- Then a **Parked** section lists each deferred item with its reason (if provided) and no errors are raised for those items

**AC-2: Parked section omitted when no deferred items exist**
- Given no deferred behaviours or implementations in the hierarchy
- When `tr-status` runs
- Then no Parked section appears in the report

**AC-3: Backlog section shows summary when backlog.md exists**
- Given `taproot/backlog.md` exists and contains at least one item
- When `/tr-status` runs
- Then a **Backlog** section appears listing the total item count and up to 3 items

**AC-4: Plan section shows pending/complete counts when plan.md exists**
- Given `taproot/plan.md` exists
- When `/tr-status` runs
- Then a **Plan** section appears showing the count of pending and complete items and the title of the next pending item

## Implementations <!-- taproot-managed -->
- [Agent Skill — /tr-status](./agent-skill/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-31
