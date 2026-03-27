# Intent: Project Discovery

## Goal
Allow any project with an existing codebase or requirements to be fully represented as a taproot requirement hierarchy — so that teams using another tool or workflow can adopt taproot without losing prior work or starting from scratch.

## Stakeholders
- **Agentic developer / orchestrator**: needs to bootstrap a taproot hierarchy for a project that was built before taproot was introduced, without manually reading every file
- **AI coding agents**: need to lead the discovery process — reading code and/or existing requirements artifacts, proposing intents and behaviours, asking clarifying questions — while the human validates and corrects
- **Team migrating from another requirements tool**: has existing PRDs, stories, ADRs, or similar — wants to adopt taproot without discarding prior work or manually re-entering requirements

## Success Criteria
- Business intents are surfaced from the project and confirmed by the human, not guessed from folder names
- Stakeholder behaviours are derived from observable system interactions or existing requirements artifacts, not from module structure
- Implementation records link confirmed behaviours to the actual source files and tests that implement them, where source exists
- A developer can import requirements from an existing project without taproot needing prior knowledge of the tool that produced them
- For requirements-only projects: behaviours are imported as `specified` with no `impl.md` files, ready to drive implementation
- When source and requirements conflict, the developer's stated precedence is applied consistently throughout the session — the outcome is never silently determined by the tool

## Constraints
- Discovery is a conversation, not a scan — the human must confirm each intent before it is written
- The process must not create intents that map 1:1 to modules, files, or CLI commands
- Existing partial taproot coverage must be detected and skipped to avoid duplication
- Discovery must be tool-agnostic — it must work for any requirements format without prior knowledge of the tool that produced it

## Behaviours <!-- taproot-managed -->
- [Discover Existing Project into Taproot Hierarchy](./discover-existing-project/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-20
