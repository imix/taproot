# Implementation: Multi-surface — config type + adapter injection + CONFIGURATION.md

## Behaviour
../usecase.md

## Design Decisions
- `cli?: string` added to `TaprootConfig` — optional, default applied at adapter generation time (not in DEFAULT_CONFIG, to keep settings.yaml minimal)
- Default value `npx @imix-js/taproot` is applied in `buildInvocationBlock()` when `config.cli` is absent
- Invocation block injected into all 6 adapter surfaces: Claude (`tr-taproot.md`), Cursor (rules file), Copilot (TAPROOT section), Windsurf (TAPROOT section), Gemini (`tr-taproot.toml`), Generic (AGENTS.md)
- **Rework**: invocation note also injected into each individual Claude and Gemini skill file (`tr-*.md`, `tr-*.toml`) — not just the config reference. Agents now see the CLI instruction inside each skill launcher, closing the gap where agents read the skill file but missed the invocation block in the config reference.
- `buildClaudeSkillFile` and `buildGeminiSkillFile` now accept `cli?` parameter; overview step uses `${taprootBin}` (not hardcoded `taproot`)
- `init.ts` writes `cli: ./taproot/agent/bin/taproot` in new settings.yaml so fresh projects get the wrapper by default
- `update.ts` `setCliWrapper()` adds `cli: ./taproot/agent/bin/taproot` when `cli:` is absent from settings — migration for existing projects; skips if `cli:` already set
- Machine-readable comment `<!-- taproot:cli-invocation: <prefix> -->` enables idempotent refresh via `taproot update` (existing adapter generation is already idempotent — regenerating overwrites fully, so no special find/replace logic needed)
- For Gemini TOML format, the marker is embedded inside the prompt string — not a standalone HTML comment
- `configuration.ts` gains a `## cli` section documenting the new settings.yaml key

## Source Files
- `src/validators/types.ts` — adds `cli?: string` to `TaprootConfig` interface
- `src/adapters/index.ts` — adds `buildInvocationBlock()`, embeds in all 6 adapter generators; adds `cli` to `buildConfigQuickRef()` table
- `src/core/configuration.ts` — adds `## cli` section to CONFIGURATION.md content

## Commits
- (run `taproot link-commits` to populate)
- `814237a4891bb9e3e34fdb9fea4a2e40a3ae5f1c` — (auto-linked by taproot link-commits)
- `00228db094186c02dec097b2940be9f565907cfb` — (auto-linked by taproot link-commits)
- `e63dfd1ff2159fad4f0b6ced5e7e8c3492c1bff5` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/cli-invocation.test.ts` — AC-1: adapter contains invocation block with default npx prefix after init; AC-2: custom cli: override is reflected in adapter; AC-3: taproot update is idempotent; AC-5: update rewrites block after cli: change; CONFIGURATION.md includes cli section

## Status
- **State:** complete
- **Created:** 2026-03-25
- **Last verified:** 2026-04-09

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds `cli?: string` to TaprootConfig (types.ts) and injects a block into adapter files (adapters/index.ts). Design decisions: optional config key with safe default; idempotent via full regeneration. No architectural constraints violated — follows established adapter patterns. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR-N entries in parent usecase.md | resolved: 2026-03-25

## DoD Resolutions
- condition: tests-passing | note: 592 tests pass (npx vitest run); cli-invocation.test.ts covers all 5 ACs with 17 tests | resolved: 2026-03-25
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files (skills/*.md) modified — only src/adapters/index.ts, src/commands/init.ts, src/commands/update.ts. | resolved: 2026-03-27T16:50:31.482Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — embedding invocation instructions in individual adapter files is a variant of the existing invocation-block pattern already documented. | resolved: 2026-03-27T16:50:31.224Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — this is a migration/bootstrap concern, not an ongoing cross-cutting gate. setCliWrapper runs once per project and stops. No new DoD entry needed. | resolved: 2026-03-27T16:50:30.968Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — setCliWrapper follows stateless CLI pattern; reads settings, writes single field, no side effects. buildClaudeSkillFile/buildGeminiSkillFile follow existing pure-function adapter pattern. | resolved: 2026-03-27T16:50:30.716Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — source code implementation, not a skill. | resolved: 2026-03-27T16:50:30.451Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skill files modified. | resolved: 2026-03-27T16:50:30.192Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified. | resolved: 2026-03-27T16:50:29.923Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — not a bulk-authoring skill. | resolved: 2026-03-27T16:50:29.671Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this is source code (adapter generators, init, update). Not a skill file. | resolved: 2026-03-27T16:50:29.416Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — invocation note text is agent-neutral: 'All taproot commands in this skill must use X instead of bare taproot'. Applies to Claude and Gemini adapters; Cursor/Copilot/Windsurf/Generic already used buildConfigQuickRef which includes the block. | resolved: 2026-03-27T16:50:29.154Z

- condition: check-if-affected: examples/ | note: not affected — examples/ don't need updating. New init now writes cli: in settings.yaml so any freshly-initialised example will have it. | resolved: 2026-03-27T16:50:28.891Z

- condition: check-if-affected: docs/ | note: not affected — docs/configuration.md already documents the cli: key from the initial implementation. No new doc sections required. | resolved: 2026-03-27T16:50:28.628Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md lists onboarding CLI commands. Invocation note is now embedded in each skill launcher file directly. No guide change needed. | resolved: 2026-03-27T16:50:28.364Z

- condition: check-if-affected: src/commands/update.ts | note: REWORK: update.ts gains setCliWrapper() — adds cli: ./taproot/agent/bin/taproot to settings.yaml when cli: is not already set. Called after bumpTaprootVersion. | resolved: 2026-03-27T16:50:28.101Z

- condition: document-current | note: REWORK: Design Decisions updated — invocation note now injected into each individual Claude/Gemini skill file; buildClaudeSkillFile and buildGeminiSkillFile accept cli? param; overview step uses taprootBin; init.ts writes cli: ./taproot/agent/bin/taproot in new settings; update.ts setCliWrapper() adds cli: when absent. | resolved: 2026-03-27T16:50:27.840Z

- condition: document-current | note: docs/configuration.md updated with ## CLI invocation / `cli` section; src/core/configuration.ts already generates ## cli section in .taproot/CONFIGURATION.md | resolved: 2026-03-25
- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts already calls generateAdapters(agent, cwd, config), which now passes config.cli through. No changes needed | resolved: 2026-03-25
- condition: check-if-affected: skills/guide.md | note: not affected — guide.md lists CLI commands for onboarding; the invocation block is injected into adapter files directly (CLAUDE.md, copilot-instructions.md, etc.) where agents already read it. No guide change needed | resolved: 2026-03-25
- condition: check-if-affected: docs/ | note: docs/configuration.md updated with cli key section | resolved: 2026-03-25
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: applicable — reviewed adapter output text. The invocation block uses neutral language ("When running taproot commands", not "Claude-specific" phrasing). Source code in types.ts, adapters/index.ts, configuration.ts uses no agent-specific terminology. Compliant | resolved: 2026-03-25
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this implementation adds adapter injection logic (library code), not a skill file. The contextual-next-steps behaviour targets skill files. | resolved: 2026-03-25
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm targets multi-document bulk-authoring skills. This is a source code implementation, not a skill. | resolved: 2026-03-25
- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified | resolved: 2026-03-25
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skill files modified | resolved: 2026-03-25
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints targets skills processing natural language needs. This is a source code implementation. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — follows existing TaprootConfig extension pattern; optional field with safe default; adapter generators all updated consistently | resolved: 2026-03-25
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: not warranted — the cli-invocation block is adapter-only output. Future implementations of new CLI commands don't need to update adapters; only taproot update regenerates them. No new DoD entry needed. | resolved: 2026-03-25
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: the full-regeneration idempotency approach (vs. find/replace) is already implicit in the adapter architecture. No new patterns.md entry warranted. | resolved: 2026-03-25
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files (skills/*.md) modified in this implementation | resolved: 2026-03-25
