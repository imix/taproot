# Discussion: Agent Skill

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

1. **Should truth-loading be a standalone sub-skill or inlined?** The skill could become `/tr-apply-truths-when-authoring`, callable by other skills. But Taproot skills are designed to be self-contained — no existing skill calls another as a sub-routine. A standalone sub-skill would create a new inter-skill dependency pattern and expose an awkward user-facing command with no meaningful standalone use. Inlining keeps skills readable and consistent with existing patterns.

2. **Which skills need injection?** The usecase lists `/tr-intent`, `/tr-behaviour`, `/tr-implement`, `/tr-refine`, and `/tr-ineed` as the actor. However, `/tr-ineed` is a router — it routes requirements to one of the other four skills, where truth-loading already happens. Injecting into the router would cause double-loading on every authoring session that goes through ineed.

3. **Where exactly to inject within each skill?** Truth-loading must happen immediately before the first act of content authoring — after all context has been gathered but before drafting begins. This gives the agent the broadest possible context (parent intent, sibling behaviours, existing implementations) before applying truths, avoiding unnecessary reads if the preconditions mean no spec will be written at all.

## Alternatives Considered

- **Standalone `/tr-apply-truths-when-authoring` skill** — rejected because it would create an inter-skill dependency pattern that no existing skill uses, and because the resulting user-facing command has no meaningful standalone invocation path.
- **Injecting into `/tr-ineed` as well** — rejected because ineed is a router; truth-loading in the terminal skill is sufficient. Double-injection would waste reads on sessions that never produce a document.
- **Shared preamble file (`skills/_truths-preamble.md`)** — considered as a middle ground between inline and standalone. Rejected because agents would need to read an extra file on every authoring session, and the procedure is compact enough (5-6 lines) to inline without creating meaningful duplication.

## Decision

Inline the truth-loading procedure into each of the four authoring skills (intent, behaviour, implement, refine) at the point immediately before the first drafting step. The procedure is compact enough that inlining is not a maintenance burden, and it keeps skills self-contained — consistent with every other skill in the library. The injection points are chosen so that full context (parent intent, siblings, existing implementations) is already loaded when the truth check runs, which minimises wasted reads in the no-truths case.

## Open Questions
- None
