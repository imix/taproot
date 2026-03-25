# Behaviour: Load Configuration

## Actor
CLI tool — loading its configuration at startup before executing any command.

## Preconditions
- The tool has been invoked with a command
- A configuration file may or may not exist in the current directory or home directory

## Main Flow
1. Tool searches for a configuration file in order: current directory → home directory → built-in defaults
2. Tool reads and parses the first configuration file found
3. Tool applies environment variable overrides (prefixed with `MYTOOL_`)
4. Tool applies command-line flag overrides
5. Tool validates the merged configuration against the schema
6. Tool makes the resolved configuration available to the command being executed

## Alternate Flows

### No configuration file found
- **Trigger:** No configuration file exists in any search location
- **Steps:**
  1. Tool uses built-in default values for all settings
  2. No error or warning is shown — missing config is normal

### Config file exists but is unreadable
- **Trigger:** Configuration file exists but cannot be parsed (invalid syntax)
- **Steps:**
  1. Tool writes an error to stderr identifying the file and the parse problem
  2. Tool exits with code 1 without executing the command

## Postconditions
- A resolved configuration object is available to the executing command
- The configuration reflects the correct precedence: flags > env vars > file > defaults

## Error Conditions
- **Invalid configuration value**: Tool writes to stderr: `Invalid config value for '<key>': <reason>. See 'mytool --help' for valid values.` and exits with code 1.

## Acceptance Criteria

**AC-1: Tool runs with defaults when no config file exists**
- Given no configuration file is present in any search location
- When the tool executes a command
- Then it runs successfully using built-in defaults with no warning

**AC-2: Command-line flags override file-based configuration**
- Given a configuration file sets a value for a key
- When the user passes a command-line flag for the same key
- Then the flag value takes precedence over the file value

**AC-3: Invalid configuration file produces a clear error**
- Given a configuration file with a syntax error or invalid value
- When the tool starts up
- Then it exits with code 1 and stderr identifies the file and the problem

## Status
- **State:** specified
- **Created:** 2026-03-25
