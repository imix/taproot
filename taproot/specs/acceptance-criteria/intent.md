# Intent: Acceptance Criteria as First-Class Hierarchy Citizens

## Goal
Make the requirement hierarchy the single source of truth for what the system is supposed to do and whether it has been verified — by embedding Gherkin-style acceptance criteria directly in behaviour specs and tracing them to test implementations.

## Stakeholders
- **Developer / agentic orchestrator**: needs acceptance criteria generated from main flows when writing specs, and a clear target for what tests must cover
- **Stakeholder / product owner**: needs to read a `usecase.md` and understand exactly what scenarios are verified — without opening test files
- **CI pipeline**: validates that every criterion is covered by at least one test and that no test references a non-existent criterion

## Success Criteria
- [ ] Every `usecase.md` with a main flow contains a `## Acceptance Criteria` section with Gherkin scenarios (`Given / When / Then`) for the main flow, each alternate flow, and each error condition
- [ ] Each criterion has a stable, immutable ID (e.g. `AC-1`) that never changes even if the scenario is reworded
- [ ] `/tr-behaviour` generates the `## Acceptance Criteria` section automatically from the main flow, alternate flows, and error conditions when writing a new spec
- [ ] `taproot acceptance-check` reports: criteria with no matching test reference, test references to non-existent criterion IDs, and `usecase.md` files missing the section entirely
- [ ] `validate-format` flags `usecase.md` files that have child implementations but no `## Acceptance Criteria` section

## Constraints
- Criterion IDs are immutable once assigned — new scenarios get new IDs; existing IDs never change
- No dependency on specific test frameworks — coverage is detected by grep (criterion ID appears in test file name or `describe`/`it` block), not by parsing test ASTs
- The Gherkin syntax is lightweight (`Given / When / Then`) — not full Cucumber feature file format

## Behaviours <!-- taproot-managed -->
- [Specify Acceptance Criteria in Behaviour Specs](./specify-acceptance-criteria/usecase.md)
- [Verify Acceptance Criteria Coverage](./verify-coverage/usecase.md)
- [Specify NFR Acceptance Criteria in Behaviour Specs](./specify-nfr-criteria/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19
