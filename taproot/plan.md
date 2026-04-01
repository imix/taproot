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
9.  pending  [implement] hitl  "add truths — run /tr-discover-truths to process review-all candidates (plan item glossary entry; display path / filesystem path distinction)"
10. done     [implement] afk   "refresh last-verified: requirements-completeness/coverage-report/cli-command/impl — coverage.ts extended this session"
11. done     [implement] afk   "refresh last-verified: requirements-compliance/check-orphans/cli-command/impl — check-orphans.ts extended this session"
