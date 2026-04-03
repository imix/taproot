# Taproot Plan

_Built: 2026-04-01 — v1.0 release blockers — 11 items_
_HITL = human decision required · AFK = agent executes autonomously_

## Items

1.  done     [implement] afk   "fix ## Tests misclassifications — aider-adapter/cli-command/impl (.aider.conf.yml → Source Files) and hook-compatibility/cli-command/impl (truth-checker.ts, adapters/index.ts → Source Files)"
2.  done     [implement] afk   "fix guide-truth-capture/agent-skill/impl — replace /tr-define-truth test reference with actual test file path or note absence"
3.  done     [implement] afk   "fix stale source refs: discover-truths/skill/impl — skills/review-all.md → skills/audit-all.md (renamed)"
4.  done     [implement] afk   "fix stale source refs: contextual-next-steps/all-skills/impl — skills/review.md → skills/audit.md, skills/review-all.md → skills/audit-all.md"
5.  done     [implement] hitl  "fix author-design-constraints/agent-skill/impl — skills/design-constraints.md never created; mark needs-rework"
6.  done     [implement] afk   "fix: commithook DoR usecase-exists check doesn't accept link.md as a valid usecase substitute — update check to treat link.md as equivalent"
7.  done     [implement] afk   "fix: offline mode silent degradation — warn explicitly when falling back to TAPROOT_OFFLINE=1 (missing repos.yaml or unresolvable clone path) instead of silently continuing"
8.  done     [implement] hitl  "fix: .taproot/ gitignore boundary — moved truth-check session to taproot/truth-checks.md, .taproot/ gitignored, old session file removed from git"
9.  done     [implement] hitl  "add truths — superseded by item 18"
10. done     [implement] afk   "refresh last-verified: requirements-completeness/coverage-report/cli-command/impl — coverage.ts extended this session"
11. done     [implement] afk   "refresh last-verified: requirements-compliance/check-orphans/cli-command/impl — check-orphans.ts extended this session"
12. done     [implement] afk   "fix cross-repo-specification/define-cross-repo-link/agent-skill/impl.md — update from needs-rework to reflect actual skill state"
13. done     [implement] afk   "add test for cross-repo-specification/signal-cross-repo-change/docs-pattern — verify pattern pointers exist in skill files"
14. done     [implement] afk   cross-repo-specification/delegate-implementation/
15. done     [implement] hitl  cross-repo-specification/enforce-linked-truth/
16. done     [implement] hitl  requirements-hierarchy/enforce-spec-abstraction/
17. deferred [implement] hitl  agent-integration/parallel-agent-execution/ — spec needs refinement (worktree vs shared-filesystem model)
18. deferred [implement] hitl  "run /tr-discover-truths to process truth candidates"
