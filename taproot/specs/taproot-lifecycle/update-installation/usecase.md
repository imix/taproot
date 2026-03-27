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

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot update](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Reports nothing to update when no adapters are installed**
- Given a project with no agent adapter files
- When the actor runs `taproot update`
- Then the first message indicates no taproot agent adapters were detected

**AC-2: Removes stale .claude/skills/taproot/ directory**
- Given a project with a stale `.claude/skills/taproot/` directory from an older version
- When the actor runs `taproot update`
- Then the stale directory is removed and the messages confirm removal

**AC-3: Removes stale tr-*.md files from .claude/skills/**
- Given a project with `tr-*.md` files in `.claude/skills/` from a short-lived layout
- When the actor runs `taproot update`
- Then those files are removed and the messages confirm removal

**AC-4: Detects old taproot/ subdir layout as claude and migrates to commands/**
- Given a project with `.claude/skills/taproot/` (old layout)
- When the actor runs `taproot update`
- Then the stale directory is removed and `.claude/commands/tr-intent.md` is created

**AC-5: Migrates old pre-commit hook to taproot commithook**
- Given a hook at `.git/hooks/pre-commit` containing old `taproot validate-*` calls
- When the actor runs `taproot update`
- Then the hook is rewritten to contain `taproot commithook` and the messages confirm migration

**AC-6: Installs hook with --with-hooks when none exists**
- Given a project with no pre-commit hook
- When the actor runs `taproot update --with-hooks`
- Then a pre-commit hook is created and the messages confirm creation

**AC-7: Reports "exists" for hook with --with-hooks when hook already present**
- Given a project with a current pre-commit hook containing `taproot commithook`
- When the actor runs `taproot update --with-hooks`
- Then the messages indicate the hook already exists

**AC-8: Ends with "Update complete." message**
- Given any project with at least one detected adapter
- When the actor runs `taproot update`
- Then the last message is "Update complete."

## Status
- **State:** implemented
- **Created:** 2026-03-19

## Notes
Both this behaviour and `agent-integration/update-adapters-and-skills` are served by the same `taproot update` command. This behaviour documents the version migration and stale-artefact removal aspect; `update-adapters-and-skills` documents the adapter/skill content refresh aspect.
