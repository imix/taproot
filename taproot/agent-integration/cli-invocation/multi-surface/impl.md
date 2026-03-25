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
- **State:** in-progress
- **Created:** 2026-03-25
- **Last verified:** 2026-03-25

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation adds `cli?: string` to TaprootConfig (types.ts) and injects a block into adapter files (adapters/index.ts). Design decisions: optional config key with safe default; idempotent via full regeneration. No architectural constraints violated — follows established adapter patterns. | resolved: 2026-03-25
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR-N entries in parent usecase.md | resolved: 2026-03-25
