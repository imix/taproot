# Intent: Project Discovery

## Goal
Reverse-engineer an existing codebase into a taproot requirement hierarchy through structured, interactive discovery — so that teams adopting taproot mid-project don't start from a blank slate.

## Stakeholders
- **Agentic developer / orchestrator**: needs to bootstrap a taproot hierarchy for a codebase that was built before taproot was introduced, without manually reading every file
- **AI coding agents**: need to lead the discovery process — reading code, proposing intents and behaviours, asking clarifying questions — while the human validates and corrects

## Success Criteria
- Business intents are surfaced from the codebase and confirmed by the human, not guessed from folder names
- Stakeholder behaviours are derived from observable system interactions, not from module structure
- Implementation records link confirmed behaviours to the actual source files and tests that implement them
- The resulting hierarchy passes `taproot validate-structure` and `taproot validate-format`

## Constraints
- Discovery is a conversation, not a scan — the human must confirm each intent before it is written
- The process must not create intents that map 1:1 to modules, files, or CLI commands
- Existing partial taproot coverage must be detected and skipped to avoid duplication

## Behaviours <!-- taproot-managed -->
- [Discover Existing Project into Taproot Hierarchy](./discover-existing-project/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
