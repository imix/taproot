# Implementation: Multi-Surface — Settings Gate + Skill Declarations

## Behaviour
../usecase.md

## Design Decisions
- Constraint activated via `check-if-affected-by: skill-architecture/neutral-dod-resolution` in settings.yaml, scoped to `skills/*.md` — only fires when a skill file is staged
- `[invoke: compress-context]` added immediately before DoD resolution in both `commit.md` (Implementation commit step 2) and `implement.md` (step 8) — the only two skills that run `taproot dod --resolve` on behalf of the developer

## Source Files
- `taproot/settings.yaml` — adds `check-if-affected-by: skill-architecture/neutral-dod-resolution` with `when: source-matches: "skills/*.md"` scope
- `skills/commit.md` — `[invoke: compress-context]` added before step 2 of Implementation commit sub-flow
- `skills/implement.md` — `[invoke: compress-context]` added before step 8
- `taproot/agent/skills/commit.md` — mirror of skills/commit.md
- `taproot/agent/skills/implement.md` — mirror of skills/implement.md

## Commits
- (run `taproot link-commits` to populate)
- `d2dc24dcd071fa7f39e886b68213af563fc5de52` — (auto-linked by taproot link-commits)
- `8358dc87c12706b3bb598fb9eab249f3c72692b1` — (auto-linked by taproot link-commits)

## Tests
- No automated tests — constraint is agent-verifiable at DoD time via `check-if-affected-by`; presence of `[invoke: compress-context]` in commit.md and implement.md is directly observable

## Status
- **State:** complete
- **Created:** 2026-04-13
- **Last verified:** 2026-04-13

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — no new interfaces or exported functions; changes are skill file text additions and a settings.yaml entry. | resolved: 2026-04-13
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: COMPLIANT — AC-1 and AC-3 are directly verifiable by reading the skill files; AC-2 is verified by the check-if-affected-by gate at DoD time. | resolved: 2026-04-13
- condition: check: does the planned interface conflict with existing patterns in arch-interface-design_behaviour.md? | note: NO — no new interfaces. | resolved: 2026-04-13
- condition: check: does an existing abstraction already cover this? See arch-code-reuse_behaviour.md | note: NO — the capability declaration is a textual addition to skill files; no code abstraction applicable. | resolved: 2026-04-13

## DoD Resolutions
- condition: document-current: README.md and docs/ accurately reflect all currently implemented CLI commands, skills, and configuration options | note: Read docs/agents.md — the Capability declarations section (lines 78-89) documents [invoke: compress-context] and the Claude adapter translation. The section was added in the agent-capability-invocation implementation. This implementation adds no new user-facing CLI commands or configuration options beyond what is already documented. Docs are current. | resolved: 2026-04-13T08:11:50.723Z
- condition: document-current | note: Read docs/agents.md — Capability declarations section (lines 78-89) documents [invoke: compress-context] and the Claude adapter translation. This implementation adds no new user-facing CLI commands or configuration options. No new docs/ file needed — [invoke: compress-context] is already documented. Docs are current. | resolved: 2026-04-13T08:42:41.101Z

- condition: check-if-affected-by: skill-architecture/neutral-dod-resolution | note: SELF-IMPLEMENTING — this is the implementation of the neutral-dod-resolution constraint. Both commit.md (Implementation commit sub-flow, step 2) and implement.md (step 8) now have [invoke: compress-context] immediately before their first DoD resolution step, satisfying C-1. | resolved: 2026-04-13T08:36:45.941Z

- condition: check-if-affected-by: taproot-modules/architecture | note: NOT APPLICABLE — changes are to skill files and settings.yaml only. No source code changes that the architecture module would evaluate. | resolved: 2026-04-13T08:36:45.653Z

- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: NOT APPLICABLE — this implementation adds a capability declaration step to skill files. It does not introduce any new output presentation or user decision points, so portable-output-patterns does not apply. | resolved: 2026-04-13T08:36:45.379Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — the only addition to skill files is [invoke: compress-context] (a capability declaration) and step renumbering. No shell command execution, no credentials, no tokens. Least-privilege is maintained: the capability declaration asks the agent to compress context, nothing else. | resolved: 2026-04-13T08:18:07.097Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the [invoke: compress-context] pattern is already documented in docs/agents.md under Capability declarations (added by agent-capability-invocation implementation). No new docs/patterns.md entry needed. | resolved: 2026-04-13T08:18:06.701Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: YES — already handled. Added check-if-affected-by: skill-architecture/neutral-dod-resolution with when: source-matches: skills/*.md to taproot/settings.yaml in this implementation. | resolved: 2026-04-13T08:18:06.394Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — no new interfaces or exported functions introduced. Changes are text additions to skill files and a single settings.yaml entry. No architectural patterns violated. | resolved: 2026-04-13T08:18:06.070Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no pattern hints added to this implementation. skill file changes are capability declarations, not pattern recognition hints. | resolved: 2026-04-13T08:18:05.787Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: COMPLIANT — commit.md is one of the two modified skill files. Reviewing commit.md against commit-awareness constraints: C-1 met (reads settings.yaml, runs taproot dod proactively before staging), C-2 met (classifies all four commit types), C-3 met (impl.md staging rule stated explicitly). The [invoke: compress-context] insertion does not affect commit classification logic. | resolved: 2026-04-13T08:15:41.451Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: COMPLIANT — this implementation is a direct application of context-engineering principles: adding [invoke: compress-context] before DoD resolution forces a context clear, ensuring DoD evaluation is derived from artifact reads rather than session memory. | resolved: 2026-04-13T08:15:41.078Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — no confirmation prompts added or removed. The [invoke: compress-context] step is autonomous agent behaviour, not a HITL pause point. | resolved: 2026-04-13T08:15:40.789Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — this implementation adds a capability declaration step, not a What's next block. No contextual-next-steps constraints apply. | resolved: 2026-04-13T08:15:40.475Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: COMPLIANT — [invoke: compress-context] is the canonical agent-agnostic capability syntax defined by agent-capability-invocation. The implementation uses this syntax in skill files, not any agent-specific command. | resolved: 2026-04-13T08:15:40.199Z

- condition: check-if-affected: examples/ | note: NOT APPLICABLE — no example files affected by adding [invoke: compress-context] to skill files. | resolved: 2026-04-13T08:13:46.822Z

- condition: check-if-affected: docs/ | note: COMPLIANT — docs/agents.md already documents [invoke: compress-context] and the capability map. No new docs/ changes needed. | resolved: 2026-04-13T08:13:46.529Z

- condition: check-if-affected: skills/guide.md | note: COMPLIANT — guide.md already has the Capability declarations section (added in agent-capability-invocation implementation). No further guide changes needed for this implementation. | resolved: 2026-04-13T08:13:46.159Z

- condition: check-if-affected: src/commands/update.ts | note: NOT APPLICABLE — no new CLI commands or update.ts logic changes. | resolved: 2026-04-13T08:13:45.760Z

- condition: check-if-affected: package.json | note: NOT APPLICABLE — no dependency changes; changes are limited to skill text files and settings.yaml. | resolved: 2026-04-13T08:13:45.457Z

