# UseCase: Configure Hierarchy Behaviour

## Actor
Agentic developer / orchestrator customising taproot to match project conventions

## Preconditions
- Taproot has been initialised (`taproot init` has been run)
- `.taproot.yaml` exists in the project root

## Main Flow
1. Actor opens `.taproot.yaml` in a text editor or agent session
2. Actor modifies one or more configuration keys:
   - `root` — path to the taproot directory (default: `taproot/`)
   - `commit_pattern` / `commit_trailer` — how commits are linked to implementations
   - `agents` — which agent adapters are active
   - `validation.require_dates` / `validation.require_status` — strictness of format checks
   - `validation.allowed_intent_states` / `allowed_behaviour_states` / `allowed_impl_states` — permitted state values
3. Actor saves the file
4. All subsequent CLI commands pick up the updated configuration automatically (no reload step)

## Alternate Flows
- **No `.taproot.yaml` present**: CLI falls back to built-in defaults and searches parent directories
- **Partial config**: unspecified keys are deep-merged with defaults — only overridden keys need to be present

## Error Conditions
- **Invalid YAML syntax**: CLI reports a parse error with the file path on next invocation
- **Unknown config key**: silently ignored (deep merge skips unrecognised keys)

## Postconditions
- All taproot CLI commands use the updated configuration
- Validation rules reflect the project's chosen conventions

## Status
- **State:** active
- **Created:** 2026-03-19
