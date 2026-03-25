# Behaviour: Help Output

## Actor
CLI user — a person who wants to understand available commands and their usage without reading external documentation.

## Preconditions
- The tool is installed and invocable

## Main Flow
1. User runs `mytool --help` or `mytool -h`
2. Tool prints a help summary to stdout:
   - Tool name and one-line description
   - Usage pattern: `mytool <command> [options]`
   - List of available commands with one-line descriptions
   - List of global flags (e.g. `--version`, `--help`)
3. Tool exits with code 0

## Alternate Flows

### Command-specific help
- **Trigger:** User runs `mytool <command> --help`
- **Steps:**
  1. Tool prints help for that specific command: description, arguments, flags, and a usage example
  2. Tool exits with code 0

### Version flag
- **Trigger:** User runs `mytool --version` or `mytool -V`
- **Steps:**
  1. Tool prints the current version string (e.g. `1.2.3`)
  2. Tool exits with code 0

## Postconditions
- Help text is printed to stdout
- Tool exits with code 0

## Acceptance Criteria

**AC-1: `--help` prints available commands and exits 0**
- Given a user runs `mytool --help`
- When the tool processes the flag
- Then it prints a list of available commands with descriptions and exits with code 0

**AC-2: Command-specific `--help` shows that command's usage**
- Given a user runs `mytool <command> --help` for a valid command
- When the tool processes the request
- Then it prints the command's description, arguments, and flags and exits with code 0

**AC-3: `--version` prints the version string**
- Given a user runs `mytool --version`
- When the tool processes the flag
- Then it prints only the version string (e.g. `1.2.3`) and exits with code 0

## Status
- **State:** specified
- **Created:** 2026-03-25
