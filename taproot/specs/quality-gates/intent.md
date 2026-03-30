# Intent: Quality Gates

## Stakeholders
- Developer / contributor: Engineer implementing a behaviour — needs clear, consistent criteria for what "done" means so they don't ship incomplete or non-compliant work
- Spec author (human or agent): Person or agent writing intents and usecases — needs to know what a well-formed spec looks like before writing it, not after the hook rejects it
- Team lead / orchestrator: Person or agent overseeing the project — needs confidence that every merged requirement document and implementation meets the team's agreed quality bar
- Operator / CI pipeline: Automated system running checks — needs machine-readable conditions to enforce without human intervention

## Goal
Enforce quality at every level of the hierarchy — from intent and usecase documents through to implementations — so that vague specs, missing acceptance criteria, and incomplete implementations are caught at commit time, not during review.

## Success Criteria
- [ ] A `usecase.md` or `intent.md` missing required quality elements (e.g. acceptance criteria, observable actor, measurable goal) is rejected at commit time with an actionable error
- [ ] Teams can configure a Definition of Done in `.taproot/settings.yaml` with one or more named conditions
- [ ] `/tr-implement` checks all configured DoD conditions before marking an impl `complete`
- [ ] Each condition produces a clear pass/fail result with an actionable error message on failure
- [ ] Agent context includes enough guidance that specs are written correctly on the first attempt

## Constraints
- Conditions must be runnable in CI and locally without difference in behaviour
- Failing a quality gate must block the commit — it cannot be silently skipped
- Semantic quality checks must use checkable heuristics (AC section present, step count, etc.) — subjective judgement stays in `/tr-review`

## Behaviours <!-- taproot-managed -->
- [Definition of Done Enforcement](./definition-of-done/usecase.md)
- [Definition of Ready](./definition-of-ready/usecase.md)
- [Architecture Compliance Check](./architecture-compliance/usecase.md)
- [Validate UseCase Quality at Commit](./validate-usecase-quality/usecase.md)
- [Validate Intent Quality at Commit](./validate-intent-quality/usecase.md)
- [NFR Measurability Check](./nfr-measurability/usecase.md)
- [State Transition Guardrails](./state-transition-guardrails/usecase.md)
- [Implementation Ordering Constraints](./impl-ordering-constraints/usecase.md)
- [Scoped DoD/DoR Conditions](./scoped-conditions/usecase.md)
- [Validate Behaviour–Intent Alignment at Commit](./validate-behaviour-intent-alignment/usecase.md)
- [Batch DoD NA Resolution](./batch-dod-na-resolution/usecase.md)
- [Commit Workflow Orchestration](./commit-workflow/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
First behaviour: configurable Definition of Done — conditions declared in `.taproot/settings.yaml` and enforced by `/tr-implement`. Future behaviours may include lint-enforcement, commit-convention checks, and coverage thresholds as first-class conditions.
