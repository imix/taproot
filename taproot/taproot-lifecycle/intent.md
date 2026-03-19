# Intent: Taproot Lifecycle

## Goal
Keep an installed taproot setup current as the tool evolves — refreshing skills, regenerating agent adapters, and removing stale artefacts from older versions.

## Stakeholders
- **Agentic developer / orchestrator**: needs installed skills and adapters to stay in sync with the installed taproot version without manual file management
- **AI coding agents**: need up-to-date skill definitions to invoke the correct workflows; stale skills cause incorrect behaviour

## Success Criteria
- Running `taproot update` refreshes all installed agent adapters and skills to match the current version
- Stale artefacts from previous layouts (renamed files, relocated directories) are detected and removed automatically
- The update is idempotent — running it multiple times produces no unintended changes
- The OVERVIEW.md is regenerated as part of each update

## Constraints
- Update only touches agents and skills that were previously installed — it does not install new adapters the user did not opt into
- The command never modifies requirement documents (intent.md, usecase.md, impl.md)

## Status
- **State:** active
- **Created:** 2026-03-19
