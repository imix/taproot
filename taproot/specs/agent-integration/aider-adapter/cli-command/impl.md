# Implementation: cli-command

## Behaviour
../usecase.md

## What was built

`generateAiderAdapter()` in `src/adapters/index.ts` — produces two adapter files:
- **`.aider.conf.yml`**: Aider config with `read:` entries pointing to all `taproot/agent/skills/*.md` files and `CONVENTIONS.md`, so every Aider session loads taproot context automatically
- **`CONVENTIONS.md`**: Taproot workflow instructions for Aider — hierarchy layout, skill list with descriptions, commit convention, CLI commands, pre-commit hook note

Merge logic: if `.aider.conf.yml` already exists, parses it with `js-yaml`, merges taproot `read:` entries without duplicating or removing developer settings. Returns `error` on invalid YAML without modifying the file.

Detection in `update.ts`: Aider adapter is detected by presence of `.aider.conf.yml` containing `taproot/agent/skills/` or `CONVENTIONS.md` containing the taproot init marker.

## Source Files

- `src/adapters/index.ts` — added `'aider'` to `AgentName`, `ALL_AGENTS`, `AGENT_TIERS` (tier 2); `generateAiderAdapter()`, `buildAiderConfYml()`, `buildAiderConventionsMd()`, `aiderReadPaths()`; `error?` field on `AdapterResult`
- `src/commands/update.ts` — Aider detection in `detectInstalledAgents()`; error handling in adapter output loop
- `src/commands/init.ts` — `'aider'` added to `AGENT_BASE_LABELS`; error handling in adapter output loop
- `.aider.conf.yml` — generated Aider config (output of `taproot init --agent aider`)
- `CONVENTIONS.md` — generated Taproot workflow instructions for Aider (output of `taproot init --agent aider`)

## Tests

- `test/integration/adapters.test.ts` — 8 Aider adapter tests: AC-1 (creates both files, correct content), AC-4 (merge preserves existing settings, idempotent), AC-6 (invalid YAML returns error), `--agent all` inclusion

## Acceptance Criteria

- [x] **AC-1**: `taproot init --agent aider` installs `.aider.conf.yml` with `read:` entries and `CONVENTIONS.md`
- [x] **AC-2**: Aider loads context automatically (structural — `.aider.conf.yml` `read:` entries drive this)
- [x] **AC-3**: Pre-commit hook fires identically (hook is agent-agnostic — unchanged)
- [x] **AC-4**: Merge preserves existing `.aider.conf.yml` settings
- [x] **AC-5**: `taproot update` refreshes adapter (Aider now in `detectInstalledAgents`)
- [x] **AC-6**: Invalid YAML stops merge with clear error

## Commits
- `dd21bb528e9b7e9dd9ef03fad2212a14ab7ba384` — (auto-linked by taproot link-commits)
- `4ecb1aa51c6b2a4c566ffb35526edf3d3a9d09fe` — (auto-linked by taproot link-commits)
- `d34ee3e3ff102a7b8dad87df5aa16998275f6563` — (auto-linked by taproot link-commits)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant. Implementation lives in src/adapters/ per module boundary rules. Uses filesystem I/O only at command boundary (generateAiderAdapter called from init/update commands). No global mutable state. Error messages are actionable (invalid YAML error includes correction hint). No architectural constraints violated. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: Not applicable — no NFR-N entries in the parent usecase.md. | resolved: 2026-03-25

## Status
- **State:** complete
- **Completed:** 2026-03-25

## DoD Resolutions
- condition: document-current | note: Updated docs/agents.md: added Aider row to the supported agents table (Tier 2) and added a dedicated ## Aider section explaining .aider.conf.yml merge behavior. README.md links to docs/agents.md — no direct enumeration of agents needed there. | resolved: 2026-03-25T19:00:26.898Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable: no skill files (skills/*.md) were created or modified in this implementation. | resolved: 2026-03-25T19:01:39.488Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: The YAML merge approach (parse with js-yaml, merge a list field, preserve all other keys, error on invalid YAML) is a novel pattern for taproot adapters. However, it's currently only used by the Aider adapter — premature to generalize before a second use case arises. No patterns.md entry added. | resolved: 2026-03-25T19:01:35.068Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: No new cross-cutting concern. The error? field on AdapterResult is an internal additive change. The Aider adapter pattern is an instance of the existing agent adapter pattern, not a new architectural layer. No new settings.yaml entries warranted. | resolved: 2026-03-25T19:01:28.705Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant: the Aider adapter follows the established adapter generator pattern (generateAdapter switch case, AgentName type, AGENT_TIERS). Uses js-yaml which is an existing dependency. Adds error? to AdapterResult for graceful error reporting — a safe additive change. No architectural constraints violated. | resolved: 2026-03-25T19:01:23.084Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable: pattern-hints applies to skills that receive a natural language description of intent. This implementation is adapter generator code — no skill file processes user intent here. | resolved: 2026-03-25T19:01:16.972Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable: commit-awareness applies to skill files that include git commit steps. No skill files were created or modified in this implementation. | resolved: 2026-03-25T19:01:12.645Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Not applicable: context-engineering applies to skill file design (skills/*.md). No skill files were created or modified in this implementation — only adapter generator code and integration tests. | resolved: 2026-03-25T19:01:12.405Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable: pause-and-confirm applies to bulk-authoring skills that queue multiple documents for writing. taproot init --agent aider generates exactly two fixed files (.aider.conf.yml, CONVENTIONS.md) as a deterministic, non-interactive operation — not a queued document workflow. | resolved: 2026-03-25T19:01:04.191Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable: this implementation adds adapter generation code (src/adapters/index.ts) and a detection routine, not a skill file. The contextual-next-steps spec applies to skill output — no skill files were added or modified. | resolved: 2026-03-25T19:00:59.268Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Compliant: the agent-agnostic standard explicitly excludes adapter files from its scope (it applies to skills/*.md and taproot/ hierarchy docs, not adapter files). The generated CONVENTIONS.md is an Aider-specific adapter file. No shared skill files were modified. | resolved: 2026-03-25T19:00:53.874Z

- condition: check-if-affected: examples/ | note: Not applicable: examples/ contains project scaffolds (book-authoring, cli-tool, settings, webapp) that do not enumerate specific agent adapters. No change needed. | resolved: 2026-03-25T19:00:47.622Z

- condition: check-if-affected: docs/ | note: Updated docs/agents.md: added Aider to the supported agents table (Tier 2) and added a dedicated ## Aider section explaining .aider.conf.yml generation and merge behavior. | resolved: 2026-03-25T19:00:39.074Z

- condition: check-if-affected: skills/guide.md | note: Not applicable: skills/guide.md is a generic onboarding guide that does not enumerate specific supported agents by name. No change needed. | resolved: 2026-03-25T19:00:38.824Z

- condition: check-if-affected: src/commands/update.ts | note: Updated: added Aider detection in detectInstalledAgents() — checks for .aider.conf.yml containing 'taproot/agent/skills/' or CONVENTIONS.md containing the taproot init marker. Also added error handling in the adapter output loop. | resolved: 2026-03-25T19:00:32.518Z

