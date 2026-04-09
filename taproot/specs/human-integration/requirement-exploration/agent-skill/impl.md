# Implementation: Agent Skill

## Behaviour
../usecase.md

## Design Decisions
- Pure agent skill — no CLI commands needed; the skill is a thinking-partner session with no file writes, matching the Output section of the spec ("No files are written by this skill")
- Registered in `SKILL_FILES` in `src/commands/init.ts` so the skill is installed by `taproot init --agent claude` and refreshed by `taproot update` — consistent with how all other skills are distributed
- Angle tracking described in prose within the skill file — agents maintain internal conversational state per the spec's requirement for implicit tracking ("agent does not narrate which angle it's on")
- `[D] Done` used for early-exit throughout (per ux-principles: `[D]` = Done/Stop for continuation prompts)
- Claude command launcher follows the thin-launcher pattern used by all other `.claude/commands/tr-*.md` files — loads the canonical skill from `taproot/agent/skills/explore.md`
- `taproot/agent/skills/explore.md` is a copy of `skills/explore.md` (package source), maintained in sync per CLAUDE.md convention

## Source Files
- `skills/explore.md` — canonical skill definition (package source); defines all steps, alternate flows, angle tracking, and next-skill routing
- `taproot/agent/skills/explore.md` — installed copy for this project; generated from `skills/explore.md` by `taproot update`
- `.claude/commands/tr-explore.md` — Claude Code command launcher; thin loader that reads the skill file at invocation time
- `src/commands/init.ts` — `SKILL_FILES` constant updated to include `'explore.md'` so the skill is installed by `taproot init --agent claude`
- `skills/guide.md` — `/tr-explore` added to the slash commands table
- `taproot/agent/docs/agents.md` — `/tr-explore` added to the skills listing

## Commits
<!-- taproot-managed -->
- `984d7f7b60a4356f93c5d3a7aac3b49e6e5bcad8` — (auto-linked by taproot link-commits)
- `202ea82deaabbe03674a1e065a76a61f626bd9f1` — (auto-linked by taproot link-commits)
- `fe5cf2ed0f79824a5d11ea817ba05c2f834a123c` — (auto-linked by taproot link-commits)

## Tests
- `test/unit/skills.test.ts` — structural validation: explore.md is readable, non-empty, has `# Skill:` heading, all required sections (Description, Inputs, Steps, Output, CLI Dependencies), Steps has numbered items, CLI Dependencies is "None"

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — pure markdown skill, no code paths or architectural decisions. docs/architecture.md constraints not violated. | resolved: 2026-04-09T10:26:28.960Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: skill is a conversational session; no performance NFRs apply; no measurable outputs to gate | resolved: 2026-04-09

## Status
- **State:** complete
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: docs/agents.md has /tr-explore row. README.md does not enumerate skills. Spec refined 2026-04-09 to add /tr-research routing — skill file updated in-sync. | resolved: 2026-04-09T10:38:26.712Z
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Not applicable — pure markdown skill, no code paths or architectural decisions. docs/architecture.md constraints not violated. | resolved: 2026-04-09T10:26:28.960Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: skills/explore.md: no shell execution, no credentials, follows least-privilege (reads OVERVIEW.md on demand only, writes nothing). Compliant with docs/security.md. | resolved: 2026-04-09T10:26:31.094Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No new pattern. One-question-at-a-time dialogue is skill-level convention, not infrastructure pattern. | resolved: 2026-04-09T10:26:30.575Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No new cross-cutting concern introduced. | resolved: 2026-04-09T10:26:30.024Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable — explore is a discovery skill, not a routing/implementation skill. Pattern checks belong in ineed/behaviour/implement/refine which already have them. | resolved: 2026-04-09T10:26:27.870Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable — explore.md has no commit steps. | resolved: 2026-04-09T10:26:27.277Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: C-1: description ~30 tokens. C-2: no embedded docs. C-3: no repetition. C-4: OVERVIEW.md read on-demand in step 0 only. C-5: /compact signal present (7+ steps). C-6: What's next block present. C-7: no always-loaded file changes. All compliant. | resolved: 2026-04-09T10:26:26.843Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable — explore.md writes no files. pause-and-confirm applies to bulk document-writing skills only. | resolved: 2026-04-09T10:26:26.282Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: explore.md ends with What's next? block with four routing options and /compact signal before it. Compliant. | resolved: 2026-04-09T10:26:25.607Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: explore.md uses 'the agent' throughout. Adapter file intentionally agent-specific per standard's scope exclusion. Compliant. | resolved: 2026-04-09T10:26:24.748Z

- condition: check-if-affected: examples/ | note: No examples use /tr-explore; core workflow examples unchanged. | resolved: 2026-04-09T10:26:23.839Z

- condition: check-if-affected: docs/ | note: docs/agents.md updated with /tr-explore entry. | resolved: 2026-04-09T10:26:23.372Z

- condition: check-if-affected: skills/guide.md | note: skills/guide.md updated — /tr-explore added to Slash Commands table. | resolved: 2026-04-09T10:26:22.527Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts imports SKILL_FILES from init.ts — explore.md added to SKILL_FILES covers this automatically. | resolved: 2026-04-09T10:26:22.015Z

- condition: check-if-affected: package.json | note: No npm changes — explore is a skill file, not a CLI command or exported API. | resolved: 2026-04-09T10:26:20.959Z

