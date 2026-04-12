# UseCase: Generate Agent Adapter

## Actor
Developer initializing taproot for a specific AI coding agent via `taproot init --agent <name>`

## Preconditions
- Taproot is installed (`taproot` CLI available)
- The developer has selected an AI coding agent to integrate: `claude`, `cursor`, `copilot`, `windsurf`, `gemini`, or `generic`
- A taproot hierarchy exists (or `taproot init` is being run for the first time)

## Main Flow
1. Developer runs `taproot init --agent <name>` (e.g. `taproot init --agent claude`)
2. System reads the canonical skill definitions from the bundled `skills/` directory, plus any module skills for quality modules declared in the project configuration (e.g. declaring `security` and `architecture` modules adds their skills to the skill set)
3. System generates agent-specific adapter files in the appropriate location:
   - **claude**: one `.md` file per skill in `.claude/commands/`, prefixed `tr-`, each containing a thin launcher prompt that loads the full skill from `taproot/skills/`
   - **cursor**: a single `.cursor/rules/taproot.md` combining all skills in Cursor's rules format
   - **copilot**: injects a taproot section into `.github/copilot-instructions.md` (creating the file if absent), using `<!-- TAPROOT:START/END -->` markers for idempotent updates
   - **windsurf**: injects a taproot section into `.windsurfrules` using the same markers
   - **gemini**: creates one `.gemini/commands/tr-<skill>.toml` file per skill — a thin launcher that loads the full skill from `.taproot/skills/`
   - **generic**: generates `AGENTS.md` at the project root with the full skill reference
   - Each adapter also includes a **Configuration Quick Reference** section listing the primary `settings.yaml` options (`language`, `vocabulary`, `definitionOfDone`) with a pointer to `.taproot/CONFIGURATION.md` for the full reference
4. System installs skill definitions to `taproot/skills/` so the agent can load them locally
5. System reports which files were created or updated

## Alternate Flows
- **`--agent all`**: Generates adapters for all six supported agents in one run
- **File already exists** (copilot/windsurf/generic): System replaces only the `<!-- TAPROOT:START -->…<!-- TAPROOT:END -->` section, preserving any other content in the file
- **Re-running on existing installation**: Adapter files are overwritten/updated (idempotent); equivalent to `taproot update`

## Error Conditions
- **Unknown agent name**: System reports an error and lists valid agent names

## Postconditions
- The AI coding agent can invoke taproot skills using its native invocation mechanism (slash command, `@taproot` mention, or chat trigger)
- Skill definitions are installed locally so agents can load full specifications without internet access
- The adapter is a thin delivery layer — all workflow logic remains in the canonical `taproot/skills/` definitions

## Notes
- The `examples/` directory contains starter projects demonstrating taproot's canonical layout. When generate-agent-adapter introduces or changes canonical `taproot/` subdirectories (e.g. `taproot/specs/`, `taproot/global-truths/`, `taproot/agent/`), the `check-if-affected: examples/` DoD condition should verify: do the example starters reflect the current full `taproot/` layout? Starters that omit newly-canonical directories mislead developers bootstrapping from them.

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot init --agent](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Claude adapter creates one command file per skill with tr- prefix in .claude/commands/**
- Given a project directory
- When the actor runs `taproot init --agent claude`
- Then one `.claude/commands/tr-<skill>.md` file is created for each core skill

**AC-17: Claude adapter generates command stubs for all declared module skills**
- Given a project with the security quality module declared in project configuration
- When the actor runs `taproot init --agent claude`
- Then `.claude/commands/` contains stubs for all security module skills (e.g. `tr-security-define.md`, `tr-security-rules.md`) in addition to core skill stubs

**AC-18: Claude adapter does not generate stubs for undeclared module skills**
- Given a project with only the user-experience module declared
- When the actor runs `taproot init --agent claude`
- Then no security-only or architecture-only skill stubs (e.g. `tr-security-define.md`, `tr-arch-define.md`) exist in `.claude/commands/`

**AC-19: Claude adapter prunes stale module stubs when a module is removed**
- Given a project where the user-experience module was previously declared and `tr-ux-visual.md` exists in `.claude/commands/`
- When the module is removed from project configuration and `taproot init --agent claude` is re-run
- Then `tr-ux-visual.md` is deleted from `.claude/commands/`

**AC-2: Each claude command file has structured frontmatter with name and description**
- Given a project with the claude adapter installed
- When the actor reads `.claude/commands/tr-intent.md`
- Then the file starts with `---\nname: 'tr-intent'` and contains a `description:` field

**AC-3: Each claude command file is a thin launcher referencing the skill file path**
- Given a project with the claude adapter installed
- When the actor reads `.claude/commands/tr-next.md`
- Then the file contains `@{project-root}/.taproot/skills/next.md` and does not inline `## Description` or `## Inputs`

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
- Then `.cursor/rules/taproot.md` is created and contains `@taproot <skill>` for every skill, with structured frontmatter

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

**AC-12: --agent all generates all six adapters**
- Given a project directory
- When the actor runs `taproot init --agent all`
- Then adapters for claude, cursor, copilot, windsurf, gemini, and generic are all generated

**AC-14: Gemini adapter creates one command file per skill in .gemini/commands/**
- Given a project directory
- When the actor runs `taproot init --agent gemini`
- Then one `.gemini/commands/tr-<skill>.toml` file is created for each skill, each referencing `.taproot/skills/<skill>.md`

**AC-13: taproot init --agent generates adapter files and includes paths in messages**
- Given a project directory
- When the actor runs `taproot init --agent cursor`
- Then the returned messages include the generated file path

**AC-15: Each adapter includes a Configuration Quick Reference section**
- Given taproot is initialised for any supported agent
- When the installed adapter file is read
- Then it contains a "Configuration Quick Reference" section listing at minimum: `language`, `vocabulary`, and `definitionOfDone` as configurable options, with a pointer to `.taproot/CONFIGURATION.md`

**AC-16: New taproot/ directories reflected in examples/**
- Given a change to generate-agent-adapter that introduces a new canonical `taproot/` subdirectory
- When the `check-if-affected: examples/` DoD condition fires
- Then the agent verifies the example starter projects include the new directory and updates them if absent — starters must reflect the full current `taproot/` layout

## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-04-12
- **Refined:** 2026-03-27 — Notes + AC-16: examples/ starter projects must reflect new canonical taproot/ directories; check-if-affected: examples/ guidance
- **Refined:** 2026-04-12 — Step 2 + AC-17–19: module skills (declared via settings.yaml modules:) must be included in adapter generation and pruned when removed
