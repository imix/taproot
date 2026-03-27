# CLI Tool Starter

A taproot hierarchy for a command-line tool. Covers command dispatch, help output, and configuration loading — the core structure of most CLI tools.

## What's included

| Area | Intents | Behaviours |
|------|---------|------------|
| Command Interface | `command-interface` | Dispatch Command, Help Output |
| Configuration | `configuration` | Load Configuration |
| Release | `release` | Publish Release |

## Vocabulary

This starter uses standard taproot vocabulary. No overrides are applied.

## DoD conditions

The `taproot/settings.yaml` includes CLI-appropriate definition-of-done conditions:

- `npm test` — run the test suite
- `npx tsc --noEmit` — type-check without emitting
- `npm run build` — verify the build passes
- README reflects all commands, flags, and exit codes
- Check if a CLI command or flag was added/modified/removed
- Check if exit codes or output format changed

## Getting started

1. Adjust the command names in `taproot/command-interface/` to match your tool
2. Add intents for each major capability area (e.g. `taproot/file-processing/`)
3. Update the `run:` commands in `taproot/settings.yaml` to match your project's scripts
4. Open your agent and run `/tr-implement` on a behaviour to generate code

## Common additions

- **`taproot/output-formatting/`** — structured output, JSON mode, colour support
- **`taproot/release/`** already included — extend with behaviours for pre-release channels, automated CI publish, or distribution via additional package managers (Homebrew, AUR, winget)
- **`taproot/plugin-system/`** — if the tool supports user-defined extensions
- **`taproot/update-check/`** — notify users when a newer version is available
- **`taproot/error-reporting/`** — structured error output, verbose/debug modes
