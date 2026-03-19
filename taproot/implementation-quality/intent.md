# Intent: Implementation Quality Standards

## Stakeholders
- Developer / contributor: Engineer implementing a behaviour — needs clear, consistent criteria for what "done" means so they don't ship incomplete or non-compliant work
- Team lead / orchestrator: Person or agent overseeing the project — needs confidence that every merged implementation meets the team's agreed quality bar
- Operator / CI pipeline: Automated system running checks — needs machine-readable conditions to enforce without human intervention

## Goal
Allow teams to declare the conditions that must hold for any implementation to be considered complete — linting, tests, documentation currency, git conventions, or any custom check — and have taproot enforce them consistently across every implementation, whether authored by a human or an AI agent.

## Success Criteria
- [ ] Teams can configure a Definition of Done in `.taproot.yaml` with one or more named conditions
- [ ] `/tr-implement` checks all configured DoD conditions before marking an impl `complete`
- [ ] Each condition produces a clear pass/fail result with an actionable error message on failure
- [ ] Built-in conditions cover the most common needs (tests passing, linter clean, README current, commit conventions)
- [ ] Custom/arbitrary shell commands can be registered as conditions, enabling any team-specific check

## Constraints
- Conditions must be runnable in CI and locally without difference in behaviour
- Failing a DoD condition must block completion — it cannot be silently skipped

## Behaviours <!-- taproot-managed -->
- [Definition of Done Enforcement](./definition-of-done/usecase.md)
- [Definition of Ready](./definition-of-ready/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
First behaviour: configurable Definition of Done — conditions declared in `.taproot.yaml` and enforced by `/tr-implement`. Future behaviours may include lint-enforcement, commit-convention checks, and coverage thresholds as first-class conditions.
