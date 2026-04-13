# Implementation: Multi-Surface — Adapter Capability Maps + Skill Authoring Guide

## Behaviour
../usecase.md

## Design Decisions
- Capability map is embedded in each Claude launcher file (alongside the CLI invocation note) — agent has the translation available the moment it loads any skill, no extra lookup needed
- Claude Code: `compress-context` → `/compact`; unknown capabilities → advisory message
- Other adapters (Gemini, Cursor, Copilot, Windsurf, Generic): embed generic fallback instruction — no capability-specific translations since no equivalent native mechanisms are known
- `skills/guide.md` carries authoring documentation for skill authors so any agent using taproot knows the `[invoke: ...]` syntax

## Source Files
- `src/adapters/index.ts` — `buildClaudeSkillFile()` adds capability map block; other adapter builders add generic fallback
- `skills/guide.md` — `## Capability declarations` subsection added to skill authoring references
- `taproot/agent/skills/guide.md` — mirror of skills/guide.md per CLAUDE.md copy-back rule

## Commits
- (run `taproot link-commits` to populate)
- `beadc1dfb82117f112fa9b0912a1e87984f8d034` — (auto-linked by taproot link-commits)
- `96e44eff1d2c20955f7bd98786167f5085a0f898` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/adapters.test.ts` — Claude launcher contains capability map with `compress-context` → `/compact`; other adapters contain generic fallback advisory

## Status
- **State:** complete
- **Created:** 2026-04-13
- **Last verified:** 2026-04-13

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — no new exported functions; capability map is an inline string addition to existing `buildClaudeSkillFile()` and adapter builder functions. Follows existing pattern (CLI invocation note). | resolved: 2026-04-13
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: COMPLIANT — AC-1b and AC-2 are directly verifiable by reading the generated launcher file; AC-3 is verified by existing agent-agnostic-language DoD check. | resolved: 2026-04-13
- condition: check: does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md? | note: NO — no new interfaces introduced; capability map text added inline to existing builder functions. | resolved: 2026-04-13
- condition: check: does an existing abstraction already cover this? See arch-code-reuse_behaviour.md | note: NO — capability map string is adapter-specific and not repeated across unrelated modules; no extraction needed. | resolved: 2026-04-13

## DoD Resolutions
- condition: document-current | note: Added '### Capability declarations' section to docs/agents.md documenting [invoke: X] syntax, compress-context → /compact mapping, and fallback advisory behaviour. README.md does not cover per-skill adapter internals — no update needed. | resolved: 2026-04-13T07:58:05.290Z
- condition: check-if-affected-by: taproot-modules/architecture | note: NOT APPLICABLE — no architecture module skill files modified. | resolved: 2026-04-13T08:03:17.125Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: NOT APPLICABLE — no skill files that produce output were modified. | resolved: 2026-04-13T08:03:16.817Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — skills/guide.md addition documents the [invoke: X] pattern with no shell commands, no credentials, no hardcoded values. Least-privilege: capability declarations are advisory-only, agents skip unknown ones. | resolved: 2026-04-13T08:03:16.532Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the capability declaration syntax is documented in docs/agents.md and guide.md. The pattern of per-adapter capability maps follows the existing adapter generator pattern already documented. | resolved: 2026-04-13T08:03:16.248Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: YES — the capability map format is now part of every adapter. Adding check-if-affected-by: agent-integration/agent-capability-invocation to settings.yaml so future adapter changes verify capability map compliance. | resolved: 2026-04-13T08:03:15.953Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — capability map strings follow existing CLI invocation note pattern; added as constants at module level. No new exports, no new interfaces. | resolved: 2026-04-13T07:59:05.560Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no skill files modified. | resolved: 2026-04-13T07:59:05.258Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — no skill files that run commit steps were modified. | resolved: 2026-04-13T07:59:04.979Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — guide.md capability section is concise (14 lines); no always-loaded file footprint increased beyond the minimal addition. | resolved: 2026-04-13T07:59:04.694Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no skill files modified that contain confirmation prompts. | resolved: 2026-04-13T07:59:04.412Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — no skill files have What's next blocks modified; src/adapters/index.ts is source code. | resolved: 2026-04-13T07:59:04.107Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — skills/guide.md added [invoke: compress-context] as the example; the declaration uses generic capability names, not agent-specific commands. No agent-specific names appear in guide.md. | resolved: 2026-04-13T07:59:03.797Z

- condition: check-if-affected: examples/ | note: NO — examples show the init flow, not adapter internals. Capability map is embedded in generated files automatically on init. | resolved: 2026-04-13T07:58:06.918Z

- condition: check-if-affected: docs/ | note: YES — added '### Capability declarations' section to docs/agents.md with capability table and example usage. | resolved: 2026-04-13T07:58:06.633Z

- condition: check-if-affected: skills/guide.md | note: YES — added '## Capability declarations' section documenting [invoke: X] syntax for skill authors. Copied to taproot/agent/skills/guide.md. | resolved: 2026-04-13T07:58:06.340Z

- condition: check-if-affected: src/commands/update.ts | note: NO — update.ts regenerates adapters via generateAdapters(); capability map text is embedded in buildClaudeSkillFile() which is called by generateAdapters(). No changes to update.ts needed. | resolved: 2026-04-13T07:58:05.923Z

- condition: check-if-affected: package.json | note: NO — no new dependencies added. | resolved: 2026-04-13T07:58:05.619Z

