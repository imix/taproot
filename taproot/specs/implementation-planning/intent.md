# Intent: Implementation Planning

## Goal
Enable orchestrators and agents to extract the next independently-implementable work item from the requirement hierarchy — as a thin vertical slice with clear acceptance criteria, dependencies, and traceability back to the originating behaviour.

## Stakeholders
- **Agentic developer / orchestrator**: needs to know what to implement next, in what order, and what "done" looks like for each item without having to manually read the entire hierarchy
- **AI coding agents**: need a self-contained, unambiguous unit of work they can implement end-to-end without requiring mid-flight human clarification (AFK slices) or with clearly-identified decision points (HITL slices)

## Success Criteria
- Unimplemented or partially-implemented behaviours can be surfaced as candidate work items
- Each work item is a vertical slice: it cuts through all relevant layers (schema, logic, API, tests) rather than implementing one layer for many behaviours
- Work items are classified as AFK (agent can implement without human input) or HITL (requires a human decision or review before proceeding)
- Dependencies between work items are identified so items can be sequenced correctly
- Each work item traces back to the behaviour(s) and intent(s) it fulfils
- A completed work item results in a passing test and an `impl.md` that can be validated by `taproot validate`

## Constraints
- Work items are derived from the existing hierarchy — this intent does not create new requirements, it plans implementation of existing ones
- Slice granularity follows the behaviour level: one behaviour (or a tightly-coupled cluster) per slice, not one layer per slice
- HITL slices should be minimised; prefer designs that allow agents to proceed independently

## Behaviours <!-- taproot-managed -->
- [Extract Next Implementable Slice](./extract-next-slice/usecase.md)
- [Build Release Plan](./build-plan/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
