# UseCase: Configure Hierarchy Behaviour

## Actor
Agentic developer / orchestrator customising taproot to match project conventions

## Preconditions
- Taproot has been initialised (`taproot init` has been run)
- `.taproot/settings.yaml` exists in the project root

## Main Flow
1. Actor opens `.taproot/settings.yaml` in a text editor or agent session
2. Actor modifies one or more configuration keys:
   - `root` — path to the taproot directory (default: `taproot/`)
   - `commit_pattern` / `commit_trailer` — how commits are linked to implementations
   - `agents` — which agent adapters are active
   - `validation.require_dates` / `validation.require_status` — strictness of format checks
   - `validation.allowed_intent_states` / `allowed_behaviour_states` / `allowed_impl_states` — permitted state values
3. Actor saves the file
4. All subsequent CLI commands pick up the updated configuration automatically (no reload step)

## Alternate Flows
- **No `.taproot/settings.yaml` present**: CLI falls back to built-in defaults
- **Partial config**: unspecified keys are deep-merged with defaults — only overridden keys need to be present

## Error Conditions
- **Invalid YAML syntax**: CLI reports a parse error with the file path on next invocation
- **Unknown config key**: silently ignored (deep merge skips unrecognised keys) — typos in key names go undetected; see Constraints

## Constraints (this behaviour)
- Unknown configuration keys are silently ignored — this is a known limitation; a typo in a key name (e.g. `comit_pattern`) produces no error and the value is discarded silently

## Postconditions
- All taproot CLI commands use the updated configuration
- Validation rules reflect the project's chosen conventions

## Acceptance Criteria

**AC-1: Updated config is picked up by next CLI invocation**
- Given an actor modifies a key in `.taproot/settings.yaml`
- When any taproot CLI command is run next
- Then the command uses the updated configuration without requiring a restart or reload step

**AC-2: Partial config deep-merges with defaults**
- Given a `.taproot/settings.yaml` that specifies only some keys
- When a CLI command reads the config
- Then unspecified keys use built-in default values

**AC-3: Missing settings file falls back to defaults**
- Given no `.taproot/settings.yaml` exists
- When a CLI command runs
- Then it uses built-in defaults and does not error

**AC-4: Invalid YAML syntax produces a clear error**
- Given `.taproot/settings.yaml` contains a YAML syntax error
- When a CLI command runs
- Then it reports a parse error with the file path

## Implementations <!-- taproot-managed -->
- [YAML Config — .taproot/settings.yaml](./yaml-config/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-20
