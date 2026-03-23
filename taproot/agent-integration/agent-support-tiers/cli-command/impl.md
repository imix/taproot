# Implementation: CLI Command — agent support tiers

## Behaviour
../usecase.md

## Design Decisions
- `AGENT_TIERS` static map lives in `src/adapters/index.ts` alongside `ALL_AGENTS` — keeps tier data co-located with the agent list
- Tier label injected into interactive `AGENT_LABELS` strings so prompt shows it inline (e.g. "Claude Code (Tier 1 — fully supported)")
- After adapter install, tier line appended to messages as a standalone line
- Tier 3 community note appended as a second line for those agents (informational only — no confirmation prompt)
- README tier table maintained as a static markdown table in `docs/agents.md`

## Source Files
- `src/adapters/index.ts` — `AGENT_TIERS` static map and `getTierLabel` helper
- `src/commands/init.ts` — interactive prompt labels with tier; tier line in install output
- `docs/agents.md` — tier table (AC-5)

## Commits
- (run `taproot link-commits` to populate)
- `c037b1aaf9971085364fa08ea25ddf9c90937b62` — (auto-linked by taproot link-commits)
- `925ee88a2169589a520612234cb464c04c027df4` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/init.test.ts` — AC-1 through AC-4, AC-6

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — AGENT_TIERS is a static map (no mutable state); tier labels are pure string formatting in commands layer; no new I/O patterns introduced. Consistent with stateless CLI and no-global-mutable-state constraints. | resolved: 2026-03-21

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — AGENT_TIERS is a static const map (no mutable state); getTierLabel is a pure function; tier labels are string formatting in commands layer; consistent with stateless CLI and no-global-mutable-state constraints. | resolved: 2026-03-21
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this impl.md is a traceability record, not a shared skill or spec. The docs/agents.md tier table names agents by design (it's a reference table about agents). | resolved: 2026-03-21
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — agent-support-tiers is a CLI command feature, not a skill file or commit step. | resolved: 2026-03-21
- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skill files modified. | resolved: 2026-03-21
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — this is a CLI init command, not a bulk-authoring agent skill. | resolved: 2026-03-21
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot init is a setup command, not an agent skill producing primary output. | resolved: 2026-03-21
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints governs agent skills that process user needs; taproot init is a CLI command. | resolved: 2026-03-21
- condition: check-if-affected: docs/agents.md | note: docs/agents.md updated with tier column in the Supported Agents table and a tier explanation paragraph. | resolved: 2026-03-21
- condition: document-current | note: docs/agents.md updated with tier table (AC-5). No other docs affected. | resolved: 2026-03-21
- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts refreshes adapter files and skills; AGENT_TIERS and getTierLabel are consumed only at init/display time, not during updates. No changes needed. | resolved: 2026-03-21
- condition: check-if-affected: skills/guide.md | note: not affected — no new slash commands or skills were added. Tier labels are a CLI output change only. | resolved: 2026-03-21
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — agent support tiers is a display/documentation concern, not a gate or quality constraint that other implementations need to check against. | resolved: 2026-03-21
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the AGENT_TIERS static map pattern is specific to this feature; no generalizable pattern beyond what already exists for adapter generation. | resolved: 2026-03-21

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21
