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

## Tests
- `test/unit/skills.test.ts` — structural validation: explore.md is readable, non-empty, has `# Skill:` heading, all required sections (Description, Inputs, Steps, Output, CLI Dependencies), Steps has numbered items, CLI Dependencies is "None"

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: pure agent skill — no source code paths introduced; no architectural patterns applied or violated | resolved: 2026-04-09
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: skill is a conversational session; no performance NFRs apply; no measurable outputs to gate | resolved: 2026-04-09

## Status
- **State:** in-progress
- **Created:** 2026-04-09
- **Last verified:** 2026-04-09
