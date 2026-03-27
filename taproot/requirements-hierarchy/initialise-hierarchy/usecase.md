# UseCase: Initialise Hierarchy in a Project

## Actor
Agentic developer / orchestrator setting up taproot in a new or existing project

## Preconditions
- A project directory exists
- The project directory is a git repository (`.git/` exists) — checked at the start of init before any user interaction
- `taproot` CLI is installed (`npm install -g taproot`)

## Main Flow
1. Actor runs `taproot init` in the project root
2. System checks that `.git/` exists in the project root — if absent, aborts immediately (see Error Conditions); no prompts are shown
3. System prompts: "Which agent adapter would you like to install?" — presents a selection list (claude, cursor, none)
4. System prompts: "Install the pre-commit hook? (Strongly recommended — prevents implementation commits without traceability and requirement commits without quality checks) [Y/n]"
5. System creates the `taproot/` root directory
6. System creates `taproot/skills/` for skill definitions
7. System writes `.taproot/settings.yaml` with default configuration
8. System writes `taproot/CONVENTIONS.md` with document format reference and commit conventions
9. System installs the selected agent adapter (if any)
10. System installs the pre-commit hook (if confirmed)
11. System reports each created path

## Alternate Flows
- **Non-interactive mode**: if `--agent <name>` is passed, skip the agent selection prompt and use the provided value; if `--with-hooks` is passed, skip the hook prompt and install the hook
- **No agent selected**: actor selects "none" at the agent prompt — adapter installation is skipped, all other steps proceed normally
- **Hook declined**: actor answers "n" at the hook prompt — hook installation is skipped; system notes "Pre-commit hook not installed — run `taproot init --with-hooks` to add it later"
- **Directory already exists**: system reports `exists` instead of `created` and skips creation — idempotent

## Postconditions
- `taproot/` directory exists with `skills/` subdirectory
- `.taproot/settings.yaml` exists with default configuration (can be customised after init)
- `taproot/CONVENTIONS.md` exists as a human-readable format reference
- `taproot/skills/` is populated with canonical skill definitions
- Selected agent adapter is installed (or none if declined)
- Pre-commit hook is installed at `.git/hooks/pre-commit` if confirmed, absent otherwise
- The project is ready to receive intent, behaviour, and implementation documents

## Error Conditions
- **No git repository**: if `.git/` is not found in the project root, system aborts immediately with `"No git repository found. Run \`git init\` first, then re-run \`taproot init\`."` — no prompts are shown and no files are created
- **No write permission**: filesystem error is surfaced; earlier steps that succeeded are not rolled back (no transactional guarantee)

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

**AC-3: Agent selection prompt installs selected adapter**
- Given a new project directory
- When the actor runs `taproot init` and selects "claude" from the agent prompt
- Then the `.taproot/skills/` directory is created and skill files are installed

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

**AC-9: Hook prompt presented with safety rationale**
- Given a new project directory
- When the actor runs `taproot init` and reaches the hook prompt
- Then the prompt describes the hook as recommended and explains what it prevents (implementation commits without traceability, requirement commits without quality checks)

**AC-10: Declining hook skips installation and reports it**
- Given a new project directory
- When the actor runs `taproot init` and answers "n" to the hook prompt
- Then no pre-commit hook is created and the output notes it was skipped

**AC-11: --agent flag skips agent selection prompt**
- Given an actor runs `taproot init --agent claude`
- When init runs
- Then no agent selection prompt is shown and the claude adapter is installed directly

**AC-12: --with-hooks flag skips hook prompt and installs hook**
- Given an actor runs `taproot init --with-hooks`
- When init runs
- Then no hook prompt is shown and the pre-commit hook is installed

**AC-13: Aborts with error before any prompts if no .git directory exists**
- Given a project directory with no `.git/` directory
- When the actor runs `taproot init`
- Then the command throws an error containing "git init" before showing any prompts, and no `taproot/` or `.taproot/` files are created

## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-27
