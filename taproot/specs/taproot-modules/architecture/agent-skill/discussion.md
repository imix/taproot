# Discussion: Agent Skill — Architecture Module

## Session
- **Date:** 2026-04-12
- **Skill:** tr-implement

## Pivotal Questions

**1. Should dependency governance use elicitation questions or a standard convention?**
Unlike the other 6 aspects, dependency governance doesn't need per-project elicitation — the rule ("never add a dependency without developer consent") is universal. The session established that agents have no HITL mechanism; there's no way to actually block an agent mid-implementation. The convention in the truth file is the primary enforcement mechanism, with an optional `run:` DoD script as a safety net. This made the sub-skill design straightforward: present standard text, confirm, offer the run: script.

**2. How do DoR check: conditions get wired for interface design and code reuse?**
The usecase requires the orchestrator to offer wiring of DoR `check:` conditions — distinct from the DoD `check-if-affected-by`. This required a Phase 4 in the orchestrator (after DoD wiring Phase 3) specifically for `definitionOfReady` wiring. The two check: questions are: "does the planned interface conflict with existing patterns?" (interface design) and "does an existing abstraction already cover this?" (code reuse).

**3. Where does the /tr-sweep offer sit in the orchestrator flow?**
The usecase (step 8) places it after truth files are written and before any wiring steps. The orchestrator implements this as a Phase 2 close-out step — after the last aspect loop iteration, before Phase 3 (dep governance run:) and Phase 4 (DoR/DoD wiring).

## Alternatives Considered

- **Separate impl records per sub-skill** — rejected because sub-skills have no independent value before the orchestrator exists; one record per implementation reduces overhead without losing traceability.
- **Using check: at DoR for dependency governance** — rejected during the grill-me session because check: conditions are agent-self-evaluated (no HITL blocking); the convention in the truth file is the substantive enforcement mechanism.
- **Adding a TypeScript CLI command** — rejected; pure skill markdown satisfies the intent constraint about not modifying core taproot source.

## Decision
Implement as 8 skill files (1 orchestrator + 7 sub-skills) following the established UX module pattern. The orchestrator adds two new phases not present in the UX module: dep governance run: script wiring and DoR check: condition wiring. The dependency governance sub-skill is a simplified variant that presents convention text rather than eliciting via questions. All other sub-skills follow the standard scan → question → draft → write pattern from the UX module.

## Open Questions
- None — all design decisions were resolved during the explore/grill-me/audit/refine sessions.
