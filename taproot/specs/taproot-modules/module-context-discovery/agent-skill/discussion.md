# Discussion: Agent Skill — Module Context Discovery

## Session
- **Date:** 2026-04-11
- **Skill:** tr-implement

## Pivotal Questions

**Sub-skill invocation vs. inline embedding in ux-define?**
The spec says module orchestrators trigger context discovery. The question was whether `ux-define` should call `/tr-module-context-discovery` as a sub-skill or embed the discovery steps inline. Sub-skill invocation is cleaner (no duplication) but has no clean "return" mechanism — when an agent invokes a skill, there's no guarantee it returns to the caller's step context. Embedding inline in `ux-define` as Phase 0 solves the return problem at the cost of minor duplication. Both code paths stay consistent because they produce the same output file (`project-context_intent.md`) and the same question sequence.

**Where to store the context record?**
Options: intent-scoped truth (`project-context_intent.md`), project-level config (`taproot/settings.yaml`), or a dedicated file in `taproot/`. Intent-scoped truth was chosen because: (a) it follows the existing truth file pattern; (b) intent scope means all modules and all levels pick it up automatically; (c) it can be committed as part of the normal `/tr-commit` flow without special handling.

**Should module-context-discovery be in SKILL_FILES or MODULE_SKILL_FILES?**
The `conventions_impl.md` truth says: "Only add a skill to SKILL_FILES if a developer would call it directly." Context discovery is developer-callable (the "Invoked directly" alternate flow confirms this), but only makes sense for projects using modules. Adding it to `MODULE_SKILL_FILES['user-experience']` keeps it out of non-module projects while making it available when needed.

## Alternatives Considered
- **Embed context discovery only in ux-define, no standalone skill** — rejected because the spec has an "Invoked directly" alternate flow; developers setting up multiple modules should be able to run context discovery once before any module.
- **Call `/tr-module-context-discovery` from ux-define as a sub-skill** — rejected due to the return-control problem; inline embedding in Phase 0 is more reliable.

## Decision
Standalone skill for direct invocation + inline Phase 0 in `ux-define.md` for orchestrator-driven discovery. The context record is an intent-scoped global truth, picked up by all modules automatically. The `[?] Get help` option at each question delegates inline to Agent Expertise Assistance logic rather than requiring a skill invocation.

## Open Questions
- When a second module is added, `module-context-discovery.md` should be included in that module's `MODULE_SKILL_FILES` list too. Consider a `SHARED_MODULE_SKILL_FILES` concept in `init.ts` to avoid repeating the filename across every module declaration.
