# Taproot Plan

_Built: 2026-04-03 — pre-v1 audit — 11 items_
_HITL = human decision required · AFK = agent executes autonomously_

## v1 release

1.  done     [implement] afk   "fix cross-repo-specification/define-cross-repo-link/usecase.md state: specified → implemented (all impls complete)"
2.  done     [implement] afk   "fix cross-repo-specification/signal-cross-repo-change/usecase.md state: specified → implemented (impl complete)"
3.  done     [implement] afk   "fix human-integration/pause-and-confirm/usecase.md state: specified → implemented (2/2 impls complete)"
4.  done     [implement] afk   "add .taproot/repos.yaml.example with commented format and usage note"
5.  done     [implement] afk   "fix skills/plan.md — status values still say skipped, should be deferred/dropped"
6.  done     [implement] afk   "docs/agents.md — add 9 missing skills: analyse-change, backlog, browse, bug, commit, decompose, define-truth, discover-truths, release"
7.  done     [implement] afk   "docs/concepts.md + docs/configuration.md — document delegated impl state for cross-repo scenarios"
8.  done     [implement] afk   "fix stale /tr-review and /tr-review-all references → /tr-audit and /tr-audit-all across specs and ux-principles truth (~30 occurrences)"
9.  done     [refine]    hitl  "slim down global truth format — rule + correct/incorrect examples only; move rationale and exceptions to a discussion.md sidecar; fix define-truth scope prompt (line 171: 'broadest/narrowest' → why/what/how guidance); add scope-appropriate content guidelines (intent=why/business rules, behaviour=what/observable patterns, impl=how/technical patterns); teach agents to generalise truths (no framework-specific details in rules — e.g. 'shared presentation belongs in the nearest common ancestor layout' not 'move CSS to +layout.svelte'); reduce token cost for agent context"

## post-v1

10. done     [spec]      hitl  "per-link offline granularity — allow selective link skip instead of all-or-nothing TAPROOT_OFFLINE=1"
11. deferred [spec]      hitl  "full DAG cycle detection — extend check-orphans to traverse multi-hop link chains"

## multi-agent

12. deferred [refine]    hitl  "agent-integration/parallel-agent-execution/ — update spec for worktree model vs shared-filesystem model before implementing"
13. deferred [spec]      hitl  "work claiming — agents atomically claim plan items via .taproot/claims/ to prevent same-item collision"
14. deferred [spec]      hitl  "agent identity in the record — impl.md, DoD resolutions, and plan.md record which agent authored each item"
15. deferred [spec]      hitl  "handoff protocol — notification from spec-writing agent to impl agent when a spec reaches 'specified'"
16. deferred [spec]      hitl  "semantic conflict resolution — tooling for merging spec meaning conflicts when two agents modify the same usecase.md"
17. deferred [spec]      hitl  "coordinator skill (tr-assign) — routes plan items to agents by role; monitors completion; handles handoffs"

## v1.1

24. done     [implement] afk   "per-repo offline mode — implement offline: <url> in .taproot/repos.yaml; extends check-orphans and pre-commit hook (spec: cross-repo-specification/per-repo-offline-mode/)"
25. done     [implement] afk   "fix remaining /tr-review-all reference in skills/sweep.md and taproot/agent/skills/sweep.md → /tr-audit-all"

## parallel-agent-execution

18. pending  [refine]    hitl  "agent-integration/parallel-agent-execution/ — align spec with worktree isolation model before any implementation begins"
19. pending  [spec]      hitl  "work claiming — atomic claim of plan items via .taproot/claims/ directory; one file per item; prevents collision"
20. pending  [spec]      hitl  "agent identity in the record — impl.md, DoD resolutions, and plan.md record which agent (name/role) authored each change"
21. pending  [spec]      hitl  "handoff protocol — spec-writing agent signals impl agent when a spec reaches 'specified'; mechanism TBD (inbox file, claims state)"
22. pending  [spec]      hitl  "semantic conflict resolution — detect and surface spec-meaning conflicts when two agents modify the same usecase.md concurrently"
23. pending  [spec]      hitl  "coordinator skill (tr-assign) — routes plan items to agents by role; depends on work claiming (19) and handoff protocol (21)"
