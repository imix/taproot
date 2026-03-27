# Intent: Mid-Session Idea and Finding Capture

## Stakeholders
- Developer: any contributor working mid-session — needs to capture an idea, finding, or deferred item instantly without breaking flow
- Project lead: wants no good ideas or discovered issues lost to context switches or forgotten by the end of a session

## Goal
Enable developers to capture ideas, findings, and deferred work items instantly mid-session — so that nothing is lost to context switches and every captured item can be triaged into the hierarchy when the time is right.

## Success Criteria
- [ ] A developer can capture a one-liner item in a single command without leaving the current task
- [ ] Captured items persist across sessions and are always findable in one designated place
- [ ] A triage step lets the developer review all captured items and decide — discard, keep, or promote to `/tr-ineed`
- [ ] The `findings.md` anti-pattern (ad-hoc files scattered across projects) is replaced by a single mechanism

## Constraints
- Capture must be instant — no required fields, no multi-step prompts
- Must not require a live agent session to add an item (CLI capture is valid)

## Behaviours <!-- taproot-managed -->
- [Manage Backlog](./manage-backlog/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-25
- **Last reviewed:** 2026-03-25

## Notes
- The backlog is a capture-and-triage tool, not a project management system — no priority, labels, or status tracking
- Items in the backlog are not part of the hierarchy; they graduate into it via `/tr-ineed` when ready
- Replaces the `findings.md` convention used informally across taproot projects
