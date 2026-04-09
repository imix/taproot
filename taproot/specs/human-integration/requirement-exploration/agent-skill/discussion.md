# Discussion: Agent Skill

## Session
- **Date:** 2026-04-09
- **Skill:** tr-implement

## Pivotal Questions

1. **CLI or pure agent?** The `/tr-explore` skill produces no files and writes nothing to disk — the output is a shared understanding between the developer and the agent. This confirmed a pure agent skill implementation (no CLI dependencies), unlike skills such as `/tr-commit` or `/tr-implement` that invoke `taproot dod`, `taproot validate-format`, etc.

2. **How to express angle tracking?** The spec requires the agent to track which angles have been covered without narrating it. The skill file describes this in the ## Notes section ("Angle tracking is internal — the agent does not narrate which angle it's on") so that the agent reads the constraint directly as part of loading the skill.

3. **What key triggers early exit?** The ux-principles truth assigns `[D]` to Done/Stop for continuation prompts. The explore flow uses `[D] Done` consistently for the early-stop alternate flow and the stall-prompt, rather than inventing a new key.

## Alternatives Considered

- **CLI-backed skill with session state** — write exploration state to `.taproot/sessions/explore-status.md` after each turn (per the batch-skill progress-persistence pattern). Rejected: explore is not a batch operation. It's a back-and-forth dialogue that the agent holds in context; no persistent state survives between turns anyway.
- **Embedding grill-me** — call `/tr-grill-me` from inside explore for the "strong opinion" alternate flow. Rejected: grill-me is adversarial and decision-branch oriented; the strong-opinion flow in explore is softer challenge-and-pivot, not relentless branch resolution. The flows are semantically distinct enough to keep separate.

## Decision

Implemented as a pure agent skill — a markdown file that the agent reads at invocation time and follows as a conversational protocol. No CLI, no files written. Registered in SKILL_FILES alongside all other skills so it is installed by `taproot init --agent claude` and refreshed by `taproot update`. The skill structure mirrors `grill-me.md` and `ineed.md` as the closest analogues.

## Open Questions
- None
