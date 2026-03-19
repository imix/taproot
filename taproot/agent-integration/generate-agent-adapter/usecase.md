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


## Status
- **State:** implemented
- **Created:** 2026-03-19
