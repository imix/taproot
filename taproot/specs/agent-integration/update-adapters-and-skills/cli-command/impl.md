# Implementation: CLI Command — taproot update

## Behaviour
../usecase.md

## Design Decisions
- Agent detection is heuristic-based (scan for characteristic files) rather than config-based — avoids requiring developers to maintain a list of installed agents in `taproot/settings.yaml`; the filesystem is the source of truth
- Stale path removal is encoded as a static list of known old layouts (`STALE_PATHS`) — explicit, auditable, and easy to extend as the tool evolves
- OVERVIEW.md regeneration is always included in the update — keeps the overview current after any skill changes without requiring a separate command
- CONFIGURATION.md installation (AC-6/AC-7) is implemented in `src/core/configuration.ts` via `buildConfigurationMd()` — content generation is pure logic in core/, write happens at the command boundary in update.ts. CONFIGURATION.md is only written when at least one adapter is detected, consistent with the existing update guard.

## Source Files
- `src/commands/update.ts` — agent detection, stale path removal, adapter regeneration, skill refresh, CONFIGURATION.md install/refresh, overview regeneration
- `src/core/configuration.ts` — `buildConfigurationMd()`: generates `.taproot/CONFIGURATION.md` content (owned by `configuration-discoverability/cli-command`, referenced here)

## Commits
- (run `taproot link-commits` to populate)
- `315a03dc7cb03b3225d404ceb60551009394a25d` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/update.test.ts` — covers detection of installed agents, stale path removal, adapter regeneration
- `test/integration/configuration.test.ts` — covers CONFIGURATION.md installed by `taproot update` (AC-6), refreshed on second run (AC-7)

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-27

## DoD Resolutions
- condition: document-current | note: UPDATED docs/configuration.md: added Quick discovery section documenting .taproot/CONFIGURATION.md (installed by taproot update) and the taproot --help footer as the primary configuration discovery surfaces. README and docs/agents.md describe what taproot update does (refreshes skills), not how; no additional changes needed. | resolved: 2026-03-24T15:16:59.944Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — generating a reference file alongside skills is a straightforward extension of the existing update flow; no new reusable pattern. | resolved: 2026-03-24T15:18:09.133Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — CONFIGURATION.md installation is specific to the update command; no new architectural constraint affecting other implementations. | resolved: 2026-03-24T15:18:08.899Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: STILL COMPLIANT — CONFIGURATION.md write added to update.ts follows same architecture as language pack and vocabulary passes: buildConfigurationMd() is pure logic in src/core/configuration.ts (no I/O), file write happens at the command boundary in update.ts. | resolved: 2026-03-24T15:18:08.662Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no new skills created. pattern-hints applies to skills that receive natural language intent. | resolved: 2026-03-24T15:17:48.672Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — taproot update is a CLI command; commit-awareness governs skill prompts, not CLI source code. | resolved: 2026-03-24T15:17:48.438Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — this is a CLI command implementation, not a skill file. | resolved: 2026-03-24T15:17:48.199Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — taproot update is a CLI command, not a multi-document authoring skill. | resolved: 2026-03-24T15:17:36.467Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — taproot update is a non-interactive CLI command, not an agent skill with a What's next? block. | resolved: 2026-03-24T15:17:36.235Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — this implementation is taproot CLI source code (src/commands/update.ts). agent-agnostic-language applies to shared skill and spec markdown files. No implicit Claude assumptions or @{project-root} syntax in this implementation. | resolved: 2026-03-24T15:17:35.995Z

- condition: check-if-affected: skills/guide.md | note: NOT AFFECTED — guide.md describes what /tr-update does for users, not the CONFIGURATION.md installation detail which is internal CLI behaviour. | resolved: 2026-03-24T15:17:09.283Z

- condition: check-if-affected: src/commands/update.ts | note: YES — modified: added import of buildConfigurationMd() and call to write .taproot/CONFIGURATION.md after skills refresh step. CONFIGURATION.md is written when at least one adapter is detected, consistent with existing update guard. | resolved: 2026-03-24T15:17:09.040Z

