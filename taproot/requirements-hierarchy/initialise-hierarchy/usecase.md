# UseCase: Initialise Hierarchy in a Project

## Actor
Agentic developer / orchestrator setting up taproot in a new or existing project

## Preconditions
- A project directory exists
- `taproot` CLI is installed (`npm install -g taproot`)
- No `taproot/` directory exists yet (or it exists but is empty)

## Main Flow
1. Actor runs `taproot init` in the project root
2. System creates the `taproot/` root directory
3. System creates `taproot/skills/` for skill definitions
4. System creates `taproot/_brainstorms/` for exploratory notes
5. System writes `.taproot.yaml` with default configuration
6. System writes `taproot/CONVENTIONS.md` with document format reference and commit conventions
7. System reports each created path

## Alternate Flows
- **Directory already exists**: system reports `exists` instead of `created` and skips creation — idempotent
- **Interactive agent selection**: if `--agent` flag is omitted, system presents a checkbox prompt to select which agent adapters to install

## Error Conditions
- **No write permission**: filesystem error is surfaced; no partial state is left

## Postconditions
- `taproot/` directory exists with standard subdirectories
- `.taproot.yaml` exists with default configuration (can be customised after init)
- `taproot/CONVENTIONS.md` exists as a human-readable format reference
- The project is ready to receive intent, behaviour, and implementation documents

## Status
- **State:** active
- **Created:** 2026-03-19
