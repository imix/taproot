# Intent: Skill Architecture Constraints

## Stakeholders
- Skill author (human or AI agent): implementing a new taproot skill — needs clear rules for how skills should be structured, what they may load, and how they signal to the developer
- Developer using taproot: wants consistent, predictable skill behaviour and a context window that doesn't degrade over a session
- Taproot maintainer: needs architectural guardrails enforced automatically on every new skill, not just documented and hoped-for

## Goal
Define and enforce the architectural constraints that govern how taproot skills are built — so that every skill is context-efficient, consistent in how it loads resources, and explicit about its effect on the developer's session. These constraints are enforced via the `check-if-affected-by` DoD gate, making compliance automatic rather than aspirational.

## Success Criteria
- [ ] Every skill implementation is automatically checked against each architecture constraint at DoD time via `check-if-affected-by`
- [ ] A new skill author (human or agent) can read the architecture constraint specs and know exactly how to structure their skill without needing to inspect existing skills for patterns
- [ ] Context window degradation from taproot skill usage is measurably reduced compared to an unconstrained baseline (fewer "context rot" failures in long sessions)
- [ ] Skills that violate a constraint are blocked at commit time, not caught in review

## Constraints
- Architecture constraints apply to *all* skill implementations — they are not opt-in
- Constraints must be expressible as agent-verifiable conditions (the `check-if-affected-by` mechanism requires an agent to reason about compliance)
- Constraints may not require changes to the taproot CLI — they govern skill *content*, not CLI behaviour

## Behaviours <!-- taproot-managed -->
- [Context-Efficient Skill Design](./context-engineering/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-20
- **Last reviewed:** 2026-03-20
