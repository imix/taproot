# Behaviour: Generate README

## Actor
Taproot maintainer / contributor — a developer working on the taproot package who has made changes that affect the user-facing surface (CLI commands, skills, configuration options).

## Preconditions
- The taproot source code is in a buildable state
- At least one CLI command or skill is implemented

## Main Flow
1. Maintainer runs the README generation step (e.g. as part of the build or release process)
2. System inspects authoritative sources: CLI command definitions, skill files, and configuration schema
3. System extracts the user-facing surface: available commands with their flags and descriptions, available skills with their descriptions, configuration options
4. System renders the README sections from extracted data and static narrative templates
5. System writes `README.md` at the project root
6. Maintainer reviews the output and commits it alongside the code change that prompted it

## Alternate Flows
### No changes to user-facing surface
- **Trigger:** Maintainer runs the generation step but no commands, skills, or config options have changed since the last generation
- **Steps:**
  1. System detects no diff in the generated output
  2. System reports "README is already up to date — no changes written"

### New skill or command not yet reflected in templates
- **Trigger:** A new command or skill exists in source but has no narrative template entry
- **Steps:**
  1. System generates a placeholder section with a `<!-- TODO: add description for <name> -->` marker
  2. System reports which items need narrative attention before the README is complete

## Postconditions
- `README.md` accurately reflects all currently implemented CLI commands, skills, and configuration options
- No manual editing of README is required to keep it in sync with the codebase

## Error Conditions
- **Source file missing or unparseable**: system reports which file could not be read and skips that section rather than failing entirely
- **Template rendering error**: system reports the error with the affected section name; remaining sections are written

## Status
- **State:** specified
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
- The README is a development artifact, not a taproot runtime artifact — generation is part of the taproot maintainer's build/release workflow, not triggered by `taproot` CLI invocations
- The authoritative sources for content are: `src/commands/`, `skills/`, and the config schema — not the taproot hierarchy itself
