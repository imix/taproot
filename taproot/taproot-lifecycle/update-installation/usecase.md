# UseCase: Update Taproot Installation

## Actor
Developer running `taproot update` after upgrading the taproot package

## Preconditions
- Taproot was previously installed and initialized in the project
- The developer has updated the taproot package (e.g. `npm install -g taproot@latest`) or wants to ensure the installation is current

## Main Flow
1. Developer runs `taproot update`
2. System detects which agents have adapters installed by scanning for characteristic files
3. System removes stale artefacts from previous taproot versions:
   - Old `.claude/skills/taproot/` subdirectory (pre-commands layout)
   - Any `tr-*.md` files in `.claude/skills/` (relocated to `.claude/commands/` in a later version)
4. System regenerates adapter files for each detected agent using the current bundled skill definitions
5. System refreshes installed skill definitions in `taproot/skills/` to match the current bundled versions
6. System regenerates `taproot/OVERVIEW.md` to reflect current hierarchy state
7. System reports all changes: stale files removed, adapter files updated, skills refreshed

## Alternate Flows
- **No adapters detected**: System reports nothing to update; no files are touched
- **First run after a version upgrade with layout changes**: Stale paths are cleaned up automatically before regeneration

## Error Conditions
- None — the update is idempotent and gracefully skips agents or files that aren't installed

## Postconditions
- All installed adapters reflect the current taproot version's skill definitions and adapter format
- Stale files from older versions are removed
- Running `taproot update` again produces no additional changes
- Agent skills invoke the correct, current workflow steps

## Status
- **State:** implemented
- **Created:** 2026-03-19

## Notes
Both this behaviour and `agent-integration/update-adapters-and-skills` are served by the same `taproot update` command. This behaviour documents the version migration and stale-artefact removal aspect; `update-adapters-and-skills` documents the adapter/skill content refresh aspect.
