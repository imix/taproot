# UseCase: Generate Agent Adapter

## Actor
Developer initializing taproot for a specific AI coding agent via `taproot init --agent <name>`

## Preconditions
- Taproot is installed (`taproot` CLI available)
- The developer has selected an AI coding agent to integrate: `claude`, `cursor`, `copilot`, `windsurf`, or `generic`
- A taproot hierarchy exists (or `taproot init` is being run for the first time)

## Main Flow
1. Developer runs `taproot init --agent <name>` (e.g. `taproot init --agent claude`)
2. System reads the canonical skill definitions from the bundled `skills/` directory
3. System generates agent-specific adapter files in the appropriate location:
   - **claude**: one `.md` file per skill in `.claude/commands/`, prefixed `tr-`, each containing a thin launcher prompt that loads the full skill from `taproot/skills/`
   - **cursor**: a single `.cursor/rules/taproot.md` combining all skills in Cursor's rules format
   - **copilot**: injects a taproot section into `.github/copilot-instructions.md` (creating the file if absent), using `<!-- TAPROOT:START/END -->` markers for idempotent updates
   - **windsurf**: injects a taproot section into `.windsurfrules` using the same markers
   - **generic**: generates `AGENTS.md` at the project root with the full skill reference
4. System installs skill definitions to `taproot/skills/` so the agent can load them locally
5. System reports which files were created or updated

## Alternate Flows
- **`--agent all`**: Generates adapters for all supported agents in one run
- **File already exists** (copilot/windsurf/generic): System replaces only the `<!-- TAPROOT:START -->…<!-- TAPROOT:END -->` section, preserving any other content in the file
- **Re-running on existing installation**: Adapter files are overwritten/updated (idempotent); equivalent to `taproot update`

## Error Conditions
- **Unknown agent name**: System reports an error and lists valid agent names

## Postconditions
- The AI coding agent can invoke taproot skills using its native invocation mechanism (slash command, `@taproot` mention, or chat trigger)
- Skill definitions are installed locally so agents can load full specifications without internet access
- The adapter is a thin delivery layer — all workflow logic remains in the canonical `taproot/skills/` definitions

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot init --agent](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Claude adapter creates one command file per skill with tr- prefix in .claude/commands/**
- Given a project directory
- When the actor runs `taproot init --agent claude`
- Then one `.claude/commands/tr-<skill>.md` file is created for each skill

**AC-2: Each claude command file has YAML frontmatter with name and description**
- Given a project with the claude adapter installed
- When the actor reads `.claude/commands/tr-intent.md`
- Then the file starts with `---\nname: 'tr-intent'` and contains a `description:` field

**AC-3: Each claude command file is a thin launcher referencing the skill file path**
- Given a project with the claude adapter installed
- When the actor reads `.claude/commands/tr-plan.md`
- Then the file contains `@{project-root}/.taproot/skills/plan.md` and does not inline `## Description` or `## Inputs`

**AC-4: Each claude command file contains imperative execution framing**
- Given a project with the claude adapter installed
- When the actor reads any tr- command file
- Then it contains `IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY` and `<steps CRITICAL="TRUE">` / `</steps>` tags

**AC-5: Claude adapter is idempotent**
- Given a project with the claude adapter already installed
- When the actor runs `taproot init --agent claude` again
- Then the command files are identical to the first run

**AC-6: Cursor adapter creates .cursor/rules/taproot.md with all skill invocations**
- Given a project directory
- When the actor runs `taproot init --agent cursor`
- Then `.cursor/rules/taproot.md` is created and contains `@taproot <skill>` for every skill, with YAML frontmatter

**AC-7: Copilot adapter creates .github/copilot-instructions.md with TAPROOT markers and all skill invocations**
- Given a project directory
- When the actor runs `taproot init --agent copilot`
- Then `.github/copilot-instructions.md` is created with `<!-- TAPROOT:START -->` / `<!-- TAPROOT:END -->` markers and a `/taproot:<skill>` entry for every skill

**AC-8: Copilot adapter appends to existing file without destroying content**
- Given a project with an existing `.github/copilot-instructions.md` containing other content
- When the actor runs `taproot init --agent copilot`
- Then the existing content is preserved and the Taproot section is added

**AC-9: Copilot adapter replaces Taproot section on second run without duplicating**
- Given a project where the copilot adapter has already been installed
- When the actor runs `taproot init --agent copilot` again
- Then exactly one `<!-- TAPROOT:START -->` marker appears in the file

**AC-10: Windsurf adapter creates .windsurfrules with all skill invocations**
- Given a project directory
- When the actor runs `taproot init --agent windsurf`
- Then `.windsurfrules` is created and contains `/taproot:<skill>` for every skill

**AC-11: Generic adapter creates AGENTS.md with full skill definitions and CLI command reference**
- Given a project directory
- When the actor runs `taproot init --agent generic`
- Then `AGENTS.md` is created containing `## Description`, `## Steps`, skill invocations, and CLI commands like `taproot validate-structure`

**AC-12: --agent all generates all five adapters**
- Given a project directory
- When the actor runs `taproot init --agent all`
- Then adapters for claude, cursor, copilot, windsurf, and generic are all generated

**AC-13: taproot init --agent generates adapter files and includes paths in messages**
- Given a project directory
- When the actor runs `taproot init --agent cursor`
- Then the returned messages include the generated file path

## Status
- **State:** implemented
- **Created:** 2026-03-19
