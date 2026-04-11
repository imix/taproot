# Discussion: Agent Skill — UX Module

## Session
- **Date:** 2026-04-11
- **Skill:** tr-implement

## Pivotal Questions

**Should all 10 skills be in one impl, or each sub-skill under its own sub-behaviour?**
The sub-behaviours (orientation, flow, etc.) each have their own usecase.md, so technically each sub-skill belongs to its own impl. However, the orchestrator calls the sub-skills directly — without them it cannot satisfy any of its ACs. Implementing them together avoids a situation where the declaration commit exists but nothing works end-to-end. Sub-behaviour impls can be added retroactively if traceability to individual sub-behaviours becomes important.

**Should UX module skills be in `SKILL_FILES` (auto-installed) or optional (manual install)?**
The intent requires "a project with no modules activated is not burdened by the feature". Bundling in `SKILL_FILES` means skill files are always present — but the burden comes from DoD conditions, not from the mere presence of skill files. Since no DoD condition runs unless the project explicitly wires `check-if-affected-by: taproot-modules/user-experience`, bundling is safe for v1. A future `taproot modules install` command could enable user-selectable installation, but that would require new CLI commands — contradicting the intent constraint "expressible without modifying core taproot source".

## Alternatives Considered

- **Each sub-skill as a separate impl** — rejected for v1; creates 9 orphaned impl.md files with no coverage until the orchestrator exists. Can be revisited after the module is validated.
- **New `taproot modules` CLI command** — rejected; the intent explicitly requires no changes to core taproot workflow. Distributing via `SKILL_FILES` and activating via `settings.yaml` achieves the same effect through existing mechanisms.
- **Sub-skills write via `/tr-define-truth`** — rejected; calling another skill from inside a skill creates a double-prompt loop and loses the orchestrator's sequencing context. Direct file writes are simpler and more robust.

## Decision

The UX module is implemented as 10 agent skill files distributed alongside existing taproot skills via `SKILL_FILES`. The orchestrator (`ux-define`) routes to sub-skills; each sub-skill writes a scoped global truth directly without delegating to `/tr-define-truth`. Projects opt in by running `/tr-ux-define` and optionally wiring the DoD condition; projects that don't invoke the skills are entirely unaffected.

## Open Questions

- Should sub-skill files be split into their own impl.md records when the sub-behaviour impls are formalised? (Likely yes — deferred to a future iteration.)
- When there are multiple modules (security, architecture, testing), should a shared `ux-define`-like orchestrator pattern be codified as a reusable pattern in `docs/patterns.md`? (Deferred — validate with the first module first.)
