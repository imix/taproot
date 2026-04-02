# Implementation: agent skill

## Behaviour
../usecase.md

## Design Decisions
- Interactive-first: skill asks for repo URL, path, and type in sequence if not provided as arguments — matches developer mental model of "I want to link to X".
- Placement suggestion mirrors target path structure (e.g. linking to `auth/plugin-login/usecase.md` suggests placing link at `auth/plugin-login/link.md`) — avoids requiring developers to know the folder convention upfront.
- `repos.yaml` setup offered inline but not required — link file is valid without it; resolution is a local convenience, not a committed concern.
- Coverage connection explained at the end of the flow — developer understands the link file alone does not count as implemented; a local `impl.md` is still required.
- `TAPROOT_OFFLINE=1` documented in Notes for CI environments where `repos.yaml` cannot exist.

## Source Files
- `taproot/agent/skills/link.md` — skill definition
- `skills/link.md` — package source copy

## Commits
- `3310e0e7f75da56c27cc23b9b676c06edbf69203` — (auto-linked by taproot link-commits)
- `95f44bb58a6716407248cf4a2cd4b3c72fc2faae` — (auto-linked by taproot link-commits)

## Tests
- (none — skill is guidance-only; validate-format integration covers link file format AC-1)

## Status
- **State:** complete
- **Created:** 2026-04-01
- **Last verified:** 2026-04-02

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: skill implementation is markdown-only — no design decisions that could conflict with docs/architecture.md. Not applicable. | resolved: 2026-04-01
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no NFR criteria on define-cross-repo-link usecase — link authoring has no measurable performance or reliability requirements. Not applicable. | resolved: 2026-04-01

## DoD Resolutions
- condition: check-if-affected: package.json | note: not applicable — prose-only impl (Source Files: taproot/agent/skills/link.md, skills/link.md); no TypeScript or other non-markdown files; auto-resolved by naRules[when:prose-only] | resolved: 2026-04-01T07:08:51.038Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: link.md and guide.md reviewed: no shell command execution without validation, no hardcoded credentials or tokens, no elevated permissions. /tr-link only writes markdown files and optionally creates repos.yaml (developer-confirmed). Compliant. | resolved: 2026-04-01T07:41:08.410Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no new reusable pattern — cross-repo linking is a specific feature, not a generalizable implementation pattern. | resolved: 2026-04-01T07:41:08.057Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no new cross-cutting concern — /tr-link is a specific skill for cross-repo authoring; no pattern that should gate all future implementations. | resolved: 2026-04-01T07:41:07.735Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: skill files are markdown only — no TypeScript design decisions. Architecture compliance applies to impl design (src/ files); skill.md has no design decisions to check against docs/architecture.md. Not applicable. | resolved: 2026-04-01T07:39:11.545Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — skill is a direct authoring tool, not a requirement-routing skill that receives natural language descriptions to pattern-match against. | resolved: 2026-04-01T07:39:11.261Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: skill does not run git commit directly — hands off to /tr-commit at end. Not applicable: no commit step in this skill. | resolved: 2026-04-01T07:39:10.994Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Description is ~30 tokens, well under the 50-token limit. No embedded reference docs. All context loaded by reference (validate-format). Compliant. | resolved: 2026-04-01T07:39:10.719Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: skill writes one file (link.md) and confirms placement before writing (step 2). Single-document write with explicit confirmation. Compliant. | resolved: 2026-04-01T07:39:10.434Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: skill ends with a What's next? block offering /tr-implement, /tr-commit, and taproot check-orphans. Compliant. | resolved: 2026-04-01T07:39:10.151Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: skill uses agent-agnostic language throughout: 'the agent', not 'Claude'. /tr-implement and /tr-commit are taproot commands, not agent-specific. Compliant. | resolved: 2026-04-01T07:39:09.876Z

- condition: check-if-affected: examples/ | note: not applicable — no new example projects or commands; link.md is a skill guide only. | resolved: 2026-04-01T07:38:07.220Z

- condition: check-if-affected: docs/ | note: docs/agents.md updated with /tr-link entry. docs/cli.md: not affected — link is a skill, not a CLI command. No other docs changes needed. | resolved: 2026-04-01T07:38:06.952Z

- condition: check-if-affected: skills/guide.md | note: skills/guide.md and taproot/agent/skills/guide.md updated: added /tr-link row to the slash commands table. | resolved: 2026-04-01T07:38:06.647Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts imports SKILL_FILES from init.ts; link.md added to SKILL_FILES in init.ts — taproot update will automatically install link.md to taproot/agent/skills/. No direct change to update.ts needed. | resolved: 2026-04-01T07:38:06.304Z

- condition: document-current | note: docs/agents.md updated: added /tr-link row to the skills table. docs/cli.md: no CLI command added — link is a skill only. README.md: does not enumerate skills individually. All docs current. | resolved: 2026-04-01T07:38:05.993Z

