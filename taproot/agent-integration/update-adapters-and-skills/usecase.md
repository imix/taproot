# UseCase: Update Adapters and Skills

## Actor
Developer running `taproot update` after upgrading taproot or modifying skill definitions

## Preconditions
- Taproot was previously initialized with at least one agent adapter
- The developer may have upgraded taproot to a new version, or modified skill definitions in `taproot/skills/`

## Main Flow
1. Developer runs `taproot update`
2. System detects which agents were previously installed by scanning for their characteristic files (`.claude/commands/tr-*.md`, `.cursor/rules/taproot.md`, etc.)
3. System reports detected adapters
4. System regenerates adapter files for each detected agent, reflecting any changes to skill definitions in the bundled `skills/` directory
5. System refreshes installed skills in `taproot/skills/` with the current bundled versions
6. System regenerates `taproot/OVERVIEW.md`
7. System reports each file created, updated, or unchanged

## Alternate Flows
- **No adapters detected**: System reports nothing to update and suggests running `taproot init --agent <name>` first
- **Claude adapter present**: Skills are always refreshed; for other agents, skills are refreshed only if a `taproot/skills/` directory already exists

## Error Conditions
- None — the update is read-then-write and does not fail on missing optional files

## Postconditions
- All installed adapters reflect the current version's skill definitions
- Installed skills in `taproot/skills/` match the bundled versions
- The update is idempotent — running it multiple times produces no unintended side effects

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot update](./cli-command/impl.md)


## Status
- **State:** implemented
- **Created:** 2026-03-19

## Notes
Both this behaviour and `taproot-lifecycle/update-installation` are served by the same `taproot update` command. This behaviour documents the adapter/skill content refresh aspect; `update-installation` documents the version migration and stale-artefact removal aspect.
