# Discussion: Agent Skill — /tr-expertise-help

## Session
- **Date:** 2026-04-11
- **Skill:** tr-implement

## Pivotal Questions

**Standalone skill vs. inline behaviour only?**
The usecase.md's Actor is "Developer who cannot confidently answer a specific question during a skill session." The behaviour can be triggered from any skill via `[?] Get help`. The question was whether to implement this as a standalone `/tr-expertise-help` skill or purely as embedded logic in every skill that has a domain question. Standalone skill was chosen because: (a) it gives developers a direct entry point when they notice they are stuck, regardless of which skill they are in; (b) the grill-me and module-context-discovery precedent shows standalone skills work well for this class of behaviour; (c) embedding in every skill would require updating all existing skills individually.

**What's the right input interface?**
Options: (a) require a `question` argument; (b) prompt the developer to state the question if invoked with no args; (c) accept the question from the calling skill's context. The skill accepts an optional `question` input and falls back to asking if omitted — this makes it usable both when invoked directly by a confused developer and when called inline by another skill that passes the question.

## Alternatives Considered
- **Embedded only (no standalone skill)** — rejected; the usecase has an explicit entry point (typing `?`, `help`, or expressing uncertainty) which implies a skill the developer can invoke directly, not just a code path inside other skills
- **Module-scoped skill** — rejected; expertise assistance is not domain-specific; any developer, on any project, working on any skill question could benefit from it

## Decision
Standalone skill `/tr-expertise-help` that accepts an optional `question` input and runs the main flow from the usecase. Other skills can reference it via `[?] Get help` options, delegating inline rather than requiring a separate invocation. The structured proposal format (project evidence / draft answer / alternatives) matches the usecase step 5 output exactly.

## Open Questions
- None.
