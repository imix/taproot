# Implementation: Multi-surface — config type + adapter injection + CONFIGURATION.md

## Behaviour
../usecase.md

## Design Decisions
- `cli?: string` added to `TaprootConfig` — optional, default applied at adapter generation time (not in DEFAULT_CONFIG, to keep settings.yaml minimal)
- Default value `npx @imix-js/taproot` is applied in `buildInvocationBlock()` when `config.cli` is absent
- Invocation block injected into all 6 adapter surfaces: Claude (`tr-taproot.md`), Cursor (rules file), Copilot (TAPROOT section), Windsurf (TAPROOT section), Gemini (`tr-taproot.toml`), Generic (AGENTS.md)
- Machine-readable comment `<!-- taproot:cli-invocation: <prefix> -->` enables idempotent refresh via `taproot update` (existing adapter generation is already idempotent — regenerating overwrites fully, so no special find/replace logic needed)
- For Gemini TOML format, the marker is embedded inside the prompt string — not a standalone HTML comment
- `configuration.ts` gains a `## cli` section documenting the new settings.yaml key

## Source Files
- `src/validators/types.ts` — adds `cli?: string` to `TaprootConfig` interface
- `src/adapters/index.ts` — adds `buildInvocationBlock()`, embeds in all 6 adapter generators; adds `cli` to `buildConfigQuickRef()` table
- `src/core/configuration.ts` — adds `## cli` section to CONFIGURATION.md content

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/cli-invocation.test.ts` — AC-1: adapter contains invocation block with default npx prefix after init; AC-2: custom cli: override is reflected in adapter; AC-3: taproot update is idempotent; AC-5: update rewrites block after cli: change; CONFIGURATION.md includes cli section

## Status
- **State:** complete
- **Created:** 2026-03-25
- **Last verified:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds `cli?: string` to TaprootConfig (types.ts) and injects a block into adapter files (adapters/index.ts). Design decisions: optional config key with safe default; idempotent via full regeneration. No architectural constraints violated — follows established adapter patterns. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR-N entries in parent usecase.md | resolved: 2026-03-25

## DoD Resolutions
- condition: tests-passing | note: 592 tests pass (npx vitest run); cli-invocation.test.ts covers all 5 ACs with 17 tests | resolved: 2026-03-25
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
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: not warranted — the cli-invocation block is adapter-only output. Future implementations of new CLI commands don't need to update adapters; only taproot update regenerates them. No new DoD entry needed. | resolved: 2026-03-25
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: the full-regeneration idempotency approach (vs. find/replace) is already implicit in the adapter architecture. No new patterns.md entry warranted. | resolved: 2026-03-25
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files (skills/*.md) modified in this implementation | resolved: 2026-03-25
