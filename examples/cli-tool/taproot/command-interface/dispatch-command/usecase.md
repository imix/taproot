# Behaviour: Dispatch Command

## Actor
CLI user — a person or script invoking the tool from a terminal.

## Preconditions
- The tool is installed and available on the user's PATH (or invocable via `npx`)
- The user has provided a valid command name and any required arguments

## Main Flow
1. User runs the tool with a subcommand and arguments: `mytool <command> [options]`
2. Tool parses the command name and arguments
3. Tool validates that required arguments are present and well-formed
4. Tool executes the command logic
5. Tool writes output to stdout
6. Tool exits with code 0

## Alternate Flows

### Unknown command
- **Trigger:** User provides a command name that does not exist
- **Steps:**
  1. Tool writes an error to stderr: `Unknown command: '<name>'. Run 'mytool --help' for available commands.`
  2. Tool exits with code 1

### Missing required argument
- **Trigger:** User omits a required argument for the command
- **Steps:**
  1. Tool writes an error to stderr identifying the missing argument and showing correct usage
  2. Tool exits with code 1

### Command execution fails
- **Trigger:** The command logic encounters an error (e.g. file not found, invalid input)
- **Steps:**
  1. Tool writes a descriptive error message to stderr
  2. Tool exits with a non-zero code appropriate to the failure type

## Postconditions
- On success: output is written to stdout and tool exits 0
- On failure: error is written to stderr and tool exits non-zero
- No partial output is left on stdout when a command fails mid-execution

## Acceptance Criteria

**AC-1: Valid command executes and exits 0**
- Given a user invokes a valid command with correct arguments
- When the command completes successfully
- Then output appears on stdout and the process exits with code 0

**AC-2: Unknown command exits 1 with helpful message**
- Given a user invokes a command name that does not exist
- When the tool processes the input
- Then it exits with code 1 and writes a message to stderr referencing `--help`

**AC-3: Missing required argument exits 1 with usage hint**
- Given a user omits a required argument for a valid command
- When the tool validates the input
- Then it exits with code 1 and stderr shows the correct usage for that command

## Status
- **State:** specified
- **Created:** 2026-03-25
