# Discussion: Agent Skill — plan-execute

## Session
- **Date:** 2026-03-27
- **Skill:** tr-implement

## Pivotal Questions

1. **CLI command or agent skill?** Execute-plan must present each item, invoke the appropriate skill, and update plan.md after each outcome. Invoking other skills is inherently agent-driven. Decision: pure skill file.

2. **How are modes detected?** The spec lists four modes (step-by-step, batch, specify, implement) that must be inferred from natural language. Embedding a lookup table of trigger phrases in the skill is simpler than asking the developer to supply an explicit flag. The skill maps common phrasings to each mode, with step-by-step as the default when nothing else matches.

3. **Do filter modes compose with step-by-step/batch?** Yes — specify and implement modes are filters applied to the pending item list before the main loop. The loop itself then runs in step-by-step or batch mode as usual. This keeps the flow simple: filter first, then execute.

4. **Should filtered-out items be marked `skipped`?** No — `skipped` implies developer intent to bypass. Filtered-out items stay `pending` so they can be processed in a later pass with a different filter. This is the expected two-pass workflow.

5. **Does batch mode skip per-item presentation?** The spec is explicit: batch confirmation is granted up-front, but each item is still shown as it executes (for visibility). The agent presents each item and proceeds immediately without waiting — unlike step-by-step which pauses after each item.

## Alternatives Considered

- **Single "run all" mode without filters** — rejected; the two-pass specify→implement workflow is a primary use case surfaced by the developer during spec review.
- **Separate skills for each mode** — rejected; modes share 90% of the execution logic. One skill with mode detection is simpler.

## Decision

Implemented as `skills/plan-execute.md` with adapter `/tr-plan-execute`. Mode detection uses natural language matching with step-by-step as default. Filters are applied before the main execution loop. Filtered-out items stay `pending`.

## Open Questions

- None — analyse-plan (the third plan-extension behaviour) is being implemented in the same session.
