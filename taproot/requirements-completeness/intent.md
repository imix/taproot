# Intent: Requirements Completeness

## Goal
Verify that no requirement has been left without coverage at the level below it — every business intent has behaviours, every behaviour has implementations, and every exception case in a behaviour has a corresponding implementation.

## Stakeholders
- **Agentic developer / orchestrator**: needs assurance that AI agents haven't silently skipped edge cases, error conditions, or entire requirements
- **AI coding agents**: need to identify gaps in the hierarchy so they can be prompted to fill them

## Success Criteria
- Intents without any behaviours are surfaced as gaps
- Behaviours without implementations are surfaced as gaps
- Exception cases and alternate flows in a usecase that lack a corresponding impl are flagged
- Coverage can be reported at any level of the hierarchy (per intent, per behaviour, globally)

## Constraints
- Completeness is assessed against what is documented, not against what might be missing from the docs themselves — garbage-in, garbage-out
- Automated completeness checks cannot detect semantically missing requirements, only structurally missing links

## Status
- **State:** active
- **Created:** 2026-03-19
