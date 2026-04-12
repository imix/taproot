# Discussion: Agent Skill — Visual Language Sub-skill

## Session
- **Date:** 2026-04-12
- **Skill:** tr-implement

## Pivotal Questions

**1. Should the colour and icon questions be one combined question or two distinct elicitation passes?**
The spec had originally combined them in a single elicitation block. During the audit the question about colour palette values and token names was identified as one question doing two jobs — recording raw hex values and establishing canonical token names. Agents consuming the truth file need token names, not hex values, to enforce consistency. Splitting into two questions ensures token naming is treated as a first-class deliverable rather than a parenthetical.

**2. Where does the sweep offer belong — in the sub-skill or the orchestrator?**
The parent intent success criterion ("After any module sub-skill writes a truth file, the developer is offered the option to run `/tr-sweep`") could be satisfied either in each sub-skill or centrally in `ux-define`. Placing it in each sub-skill means the offer appears when a sub-skill is invoked directly (without the orchestrator), which is the more common developer flow after initial setup. The orchestrator can suppress duplicate offers when running in batch mode.

## Alternatives Considered

- **Add visual as an aspect inside the existing `agent-skill/impl.md`** — rejected because that impl.md covers the original activation behaviour (`user-experience/usecase.md`), not the new `visual/usecase.md`. Each behaviour spec warrants its own traceability record.
- **Combine colour and icon elicitation into separate sub-sub-skills** — rejected as over-engineering; colour and icon set are both visual identity concerns and are typically decided together. The partial-session alternate flow handles the case where they're not.

## Decision

Implement as a single `skills/ux-visual.md` skill file, following the identical pattern established by the 9 sibling sub-skills. Two changes distinguish it from the siblings: the colour palette question is split into values + token names, and the sweep offer is included at write time (satisfying the parent intent success criterion). The orchestrator (`ux-define.md`) is updated to include `visual` as a 10th aspect.

## Open Questions

- The sweep offer is now in `ux-visual.md` but missing from all 9 sibling sub-skills. A follow-up sweep of the sibling specs (or a `/tr-promote` to flag the gap at intent level) would propagate this to the other aspects.
