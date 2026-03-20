# UseCase: Initialise Hierarchy in a Project

## Actor
Agentic developer / orchestrator setting up taproot in a new or existing project

## Preconditions
- A project directory exists
- `taproot` CLI is installed (`npm install -g taproot`)

## Main Flow
1. Actor runs `taproot init` in the project root
2. System creates the `taproot/` root directory
3. System creates `taproot/skills/` for skill definitions
4. System creates `taproot/_brainstorms/` for exploratory notes
5. System writes `.taproot/settings.yaml` with default configuration
6. System writes `taproot/CONVENTIONS.md` with document format reference and commit conventions
7. System reports each created path

## Alternate Flows
- **Directory already exists**: system reports `exists` instead of `created` and skips creation — idempotent
- **Interactive agent selection**: if `--agent` flag is omitted, system presents a checkbox prompt to select which agent adapters to install

## Error Conditions
- **No write permission**: filesystem error is surfaced; earlier steps that succeeded are not rolled back (no transactional guarantee)

## Postconditions
- `taproot/` directory exists with standard subdirectories (`skills/`, `_brainstorms/`)
- `.taproot/settings.yaml` exists with default configuration (can be customised after init)
- `taproot/CONVENTIONS.md` exists as a human-readable format reference
- `taproot/skills/` is populated with canonical skill definitions
- The project is ready to receive intent, behaviour, and implementation documents

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot init](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Creates taproot/ directory**
- Given a new empty project directory
- When the actor runs `taproot init`
- Then a `taproot/` directory is created

**AC-2: Creates .taproot/settings.yaml**
- Given a new empty project directory
- When the actor runs `taproot init`
- Then `.taproot/settings.yaml` is created

**AC-3: Creates .taproot/skills/ directory when claude agent is selected**
- Given a project directory
- When the actor runs `taproot init --agent claude`
- Then `.taproot/skills/` directory is created

**AC-4: Does not create taproot/_brainstorms/ directory**
- Given a new empty project directory
- When the actor runs `taproot init`
- Then `taproot/_brainstorms/` is not created

**AC-5: Creates taproot/CONVENTIONS.md**
- Given a new empty project directory
- When the actor runs `taproot init`
- Then `taproot/CONVENTIONS.md` is created

**AC-6: Returns messages describing what was created**
- Given a new empty project directory
- When the actor runs `taproot init`
- Then the returned messages include references to `taproot/` and `.taproot/settings.yaml`

**AC-7: Is idempotent — running twice does not fail**
- Given a project where `taproot init` has already been run
- When the actor runs `taproot init` again
- Then the command completes without throwing an error

**AC-8: Reports "exists" on second run instead of "created"**
- Given a project where `taproot init` has already been run
- When the actor runs `taproot init` again
- Then the returned messages include the word "exists"

## Status
- **State:** implemented
- **Created:** 2026-03-19
