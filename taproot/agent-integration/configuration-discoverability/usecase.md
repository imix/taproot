# Behaviour: Configuration Discoverability

## Actor
AI coding agent — given a natural-language configuration task ("configure taproot for German", "add vocabulary overrides for book authoring") by the developer

## Preconditions
- taproot is initialised in the project (`taproot/` directory exists, `.taproot/settings.yaml` present)
- At least one agent adapter has been installed (`taproot init --agent <name>`)

## Main Flow
1. Agent receives a configuration task from the developer (e.g. "konfiguriere taproot auf deutsch um")
2. Agent reads its installed adapter file (e.g. `.claude/commands/`, `.cursor/rules/taproot.md`) — the adapter includes a **Configuration Quick Reference** section listing available `settings.yaml` options and their effect
3. Agent reads `.taproot/CONFIGURATION.md` — installed by `taproot init`, refreshed by `taproot update` — which documents all `settings.yaml` fields with examples, valid values, and the CLI commands needed to apply changes
4. Agent identifies the correct `settings.yaml` field and value for the requested task (e.g. `language: de`)
5. Agent edits `.taproot/settings.yaml` with the required change
6. Agent runs `taproot update` to apply the configuration change (language pack substitution, vocabulary overrides, adapter regeneration)
7. Agent confirms the change is applied and reports back to the developer

## Alternate Flows

### Agent uses `taproot --help` as first discovery surface
- **Trigger:** Agent runs `taproot --help` before reading adapter or CONFIGURATION.md
- **Steps:**
  1. `taproot --help` output includes a footer: `"Configuration: edit .taproot/settings.yaml — see .taproot/CONFIGURATION.md for all options"`
  2. Agent reads `.taproot/CONFIGURATION.md` and proceeds from Main Flow step 4

### Configuration file not yet installed
- **Trigger:** `.taproot/CONFIGURATION.md` does not exist (taproot was initialised before this feature shipped)
- **Steps:**
  1. Agent runs `taproot update`
  2. `taproot update` installs `.taproot/CONFIGURATION.md` alongside skill files
  3. Agent proceeds from Main Flow step 3

### Unknown configuration option requested
- **Trigger:** Developer asks for a configuration that does not exist in taproot (e.g. "set default branch to main")
- **Steps:**
  1. Agent reads CONFIGURATION.md and does not find a matching field
  2. Agent reports: "This setting is not available in taproot's `settings.yaml`. Available configuration options are: [lists options from CONFIGURATION.md]"

### `taproot update` required after edit but not run
- **Trigger:** Agent edits `settings.yaml` but forgets to run `taproot update`
- **Steps:**
  1. `settings.yaml` is changed but skill files and adapters still reflect the previous configuration
  2. CONFIGURATION.md documents which changes require `taproot update` to take effect vs. which are read at runtime (validators, commithook)
  3. Agent runs `taproot update` before confirming the task complete

## Postconditions
- `.taproot/settings.yaml` reflects the requested configuration
- `taproot update` has been run where required — skill files and adapters reflect the new configuration
- The developer's agent session used only locally-installed files to complete the task (no external docs consulted)

## Error Conditions
- **CONFIGURATION.md missing after `taproot update`**: `taproot update` reports a warning if it cannot write CONFIGURATION.md (permissions error, disk full); configuration changes in `settings.yaml` still take effect at runtime
- **Invalid `settings.yaml` value**: `taproot update` aborts with a validation error identifying the offending field and listing valid values — no files are modified

## Flow
```mermaid
flowchart TD
    A[Agent receives config task] --> B{Knows how to configure?}
    B -->|No| C[Read installed adapter\nConfiguration Quick Reference]
    B -->|Yes| E
    C --> D[Read .taproot/CONFIGURATION.md]
    D --> E[Identify settings.yaml field + value]
    E --> F[Edit .taproot/settings.yaml]
    F --> G{Requires taproot update?}
    G -->|Yes| H[Run taproot update]
    G -->|No| I[Takes effect at runtime]
    H --> J[Confirm change applied]
    I --> J

    K[taproot --help] -->|footer hint| D
    L[CONFIGURATION.md missing] --> M[Run taproot update to install it]
    M --> D
```

## Related
- `./generate-agent-adapter/usecase.md` — adapter generation must include the Configuration Quick Reference section
- `./update-adapters-and-skills/usecase.md` — `taproot update` installs and refreshes CONFIGURATION.md alongside skills
- `../../taproot-adaptability/language-support/usecase.md` — primary configuration task this behaviour enables agents to discover
- `../../taproot-adaptability/domain-vocabulary/usecase.md` — secondary configuration task (vocabulary overrides)
- `../../requirements-hierarchy/configure-hierarchy/usecase.md` — `settings.yaml` is the shared configuration surface

## Acceptance Criteria

**AC-1: Agent completes language configuration using only local files**
- Given taproot is initialised with a Claude adapter and `.taproot/CONFIGURATION.md` is present
- When the developer asks the agent to "configure taproot for German"
- Then the agent edits `settings.yaml` with `language: de` and runs `taproot update` — without reading any URL or external documentation

**AC-2: `taproot --help` surface points to CONFIGURATION.md**
- Given a project with taproot installed
- When an agent (or developer) runs `taproot --help`
- Then the output includes a reference to `.taproot/settings.yaml` and `.taproot/CONFIGURATION.md`

**AC-3: CONFIGURATION.md is installed by `taproot init` and refreshed by `taproot update`**
- Given a fresh project with no `.taproot/CONFIGURATION.md`
- When the developer runs `taproot init --agent claude` or `taproot update`
- Then `.taproot/CONFIGURATION.md` is created and documents all `settings.yaml` options with examples

**AC-4: CONFIGURATION.md survives taproot upgrades**
- Given taproot is upgraded to a new version
- When the developer runs `taproot update`
- Then `.taproot/CONFIGURATION.md` is refreshed to reflect any new or changed configuration options

**AC-5: Adapter includes Configuration Quick Reference**
- Given taproot is initialised for any supported agent
- When the installed adapter file is read
- Then it contains a Configuration Quick Reference section listing at minimum: `language`, `vocabulary`, and `definitionOfDone` as configurable options with a pointer to CONFIGURATION.md

**AC-6: Unknown config option produces helpful response**
- Given an agent reads CONFIGURATION.md
- When the developer requests a configuration option not present in CONFIGURATION.md
- Then the agent reports the unavailability and lists the available options sourced from CONFIGURATION.md

## Implementations <!-- taproot-managed -->

## Status
- **State:** specified
- **Created:** 2026-03-24
- **Last reviewed:** 2026-03-24
