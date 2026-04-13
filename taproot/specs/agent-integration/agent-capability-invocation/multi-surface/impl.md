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

## Tests
- `test/integration/adapters.test.ts` — Claude launcher contains capability map with `compress-context` → `/compact`; other adapters contain generic fallback advisory

## Status
- **State:** in-progress
- **Created:** 2026-04-13
- **Last verified:** 2026-04-13

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — no new exported functions; capability map is an inline string addition to existing `buildClaudeSkillFile()` and adapter builder functions. Follows existing pattern (CLI invocation note). | resolved: 2026-04-13
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: COMPLIANT — AC-1b and AC-2 are directly verifiable by reading the generated launcher file; AC-3 is verified by existing agent-agnostic-language DoD check. | resolved: 2026-04-13
- condition: check: does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md? | note: NO — no new interfaces introduced; capability map text added inline to existing builder functions. | resolved: 2026-04-13
- condition: check: does an existing abstraction already cover this? See arch-code-reuse_behaviour.md | note: NO — capability map string is adapter-specific and not repeated across unrelated modules; no extraction needed. | resolved: 2026-04-13
