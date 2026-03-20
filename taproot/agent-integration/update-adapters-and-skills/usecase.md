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


## Acceptance Criteria

**AC-1: Reports nothing to update when no adapters are installed**
- Given a project with no agent adapter files
- When the actor runs `taproot update`
- Then the first message indicates no taproot agent adapters were detected

**AC-2: Detects and regenerates claude adapter**
- Given a project with the claude adapter installed
- When the actor runs `taproot update`
- Then messages indicate the claude adapter was processed and `tr-intent.md` was updated

**AC-3: Detects and regenerates cursor adapter**
- Given a project with the cursor adapter installed
- When the actor runs `taproot update`
- Then messages indicate the cursor adapter was processed and `taproot.md` was updated

**AC-4: Refreshes installed skills if present**
- Given a project with a `taproot/skills/` directory
- When the actor runs `taproot update`
- Then messages indicate skills were refreshed

**AC-5: Ends with "Update complete." message**
- Given any project with at least one detected adapter
- When the actor runs `taproot update`
- Then the last message is "Update complete."

## Status
- **State:** implemented
- **Created:** 2026-03-19

## Notes
Both this behaviour and `taproot-lifecycle/update-installation` are served by the same `taproot update` command. This behaviour documents the adapter/skill content refresh aspect; `update-installation` documents the version migration and stale-artefact removal aspect.
