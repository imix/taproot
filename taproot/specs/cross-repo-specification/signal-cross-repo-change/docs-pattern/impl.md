# Implementation: docs pattern

## Behaviour
../usecase.md

## Design Decisions
- No standalone skill command — the handoff is an inline agent behaviour triggered by other skills (implement, commit, link), not a developer-invoked command. A dedicated `/tr-signal` would require the developer to know when to invoke it; embedding the trigger in existing skills means it fires automatically at the right moment.
- Pattern entry in `docs/patterns.md` rather than a new skill file — the "implementation" is guidance embedded in three existing skills, which is the right level of abstraction for a cross-cutting behaviour.
- Pointers added to implement, commit, and link skills at the exact points where cross-repo conflicts surface: truth loading (implement), truth conflict resolution (commit), source-repo truth guidance (link).

## Source Files
- `docs/patterns.md` — cross-repo change handoff pattern: format, trigger rules, blocking/non-blocking, autonomous mode
- `taproot/agent/docs/patterns.md` — mirror
- `skills/implement.md` — pointer added at step 3a (cross-repo truth conflict note)
- `taproot/agent/skills/implement.md` — mirror
- `skills/commit.md` — pointer added at truth conflict resolution (linked truth can't be fixed locally)
- `taproot/agent/skills/commit.md` — mirror
- `skills/link.md` — pointer added at source-repo truth-link section (T-5 / handoff note); also includes S-0 branch and truth-link source guidance added in previous session
- `taproot/agent/skills/link.md` — mirror

## Commits
- (placeholder)

## Tests
- (none — pattern documentation; no CLI or TypeScript changes)

## Status
- **State:** complete
- **Created:** 2026-04-01
- **Last verified:** 2026-04-01

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: prose-only impl — skill pointers and pattern entry only; no TypeScript design decisions. Not applicable. | resolved: 2026-04-01T10:25:52.464Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no NFR criteria on this usecase — handoff surfacing has no measurable performance requirements. Not applicable. | resolved: 2026-04-01

## DoD Resolutions
- condition: check-if-affected: package.json | note: not applicable — prose-only impl (Source Files: docs/patterns.md, taproot/agent/docs/patterns.md, skills/implement.md, taproot/agent/skills/implement.md, skills/commit.md, taproot/agent/skills/commit.md, skills/link.md, taproot/agent/skills/link.md); no TypeScript or other non-markdown files; auto-resolved by naRules[when:prose-only] | resolved: 2026-04-01T11:00:00.000Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: reviewed skills/implement.md, skills/commit.md, skills/link.md additions: one-liner pointers only — no shell execution, no credentials, no elevated permissions. Pattern entry in docs/patterns.md: no shell execution, agent writes only to taproot/backlog.md (developer-owned file). Compliant. | resolved: 2026-04-01T11:00:00.000Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — the cross-repo change handoff pattern was added to docs/patterns.md as part of this implementation. | resolved: 2026-04-01T11:00:00.000Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — the handoff pattern is a behavioural guideline for agents, not a structural enforcement gate. No settings.yaml entry warranted. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: this story IS the pattern entry in docs/patterns.md. Pattern-hints spec requires pattern-check to fire when a semantic match is found — the new pattern entry is discoverable. Compliant. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — the pattern does not run git commit; it is triggered during implement/commit/link workflows which already handle commit awareness independently. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: no new skill file; added one-liner pointer notes to three existing skills — negligible token cost. Context engineering constraints apply to skill Description sections; no new Description added. Compliant. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: blocking case in pattern says agent must pause and present the handoff before proceeding — compliant. Non-blocking and autonomous cases are also explicitly addressed. Compliant. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — inline behaviour embedded in existing skills; no standalone skill with its own output block. The What's next blocks in the host skills (implement, commit, link) are unchanged and remain compliant. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: additions to implement.md, commit.md, link.md use 'the agent' and 'developer' throughout — no Claude-specific language. Pattern entry in docs/patterns.md is agent-agnostic. Compliant. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected: examples/ | note: not applicable — no new CLI command or skill invocation pattern; examples/ unchanged. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected: docs/ | note: docs/patterns.md updated with cross-repo change handoff pattern. taproot/agent/docs/patterns.md mirrored. No other docs/ files affected. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected: skills/guide.md | note: not applicable — no new slash command; the cross-repo handoff is an inline agent behaviour embedded in existing skills, not a developer-invoked command. guide.md slash commands table unchanged. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected: src/commands/update.ts | note: not applicable — no new skill file added; only pointers inserted into three existing skill files (implement.md, commit.md, link.md). SKILL_FILES list in init.ts unchanged. | resolved: 2026-04-01T11:00:00.000Z
- condition: document-current | note: docs/patterns.md updated with cross-repo change handoff pattern (format, trigger rules, blocking/non-blocking, autonomous mode). README.md does not enumerate patterns individually — no update needed. | resolved: 2026-04-01T11:00:00.000Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: prose-only impl — skill pointers and pattern entry only; no TypeScript design decisions. Not applicable. | resolved: 2026-04-01T11:00:00.000Z

