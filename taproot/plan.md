# Taproot Plan

_Built: 2026-03-29 — updated 2026-04-01 — 17 items_
_HITL = human decision required · AFK = agent executes autonomously_

## Items

1.  dropped  [spec]      hitl  "taproot scale justification — agents complain overhead is too high for small projects; spec lighter entry paths or starter mode"
2.  skipped  [implement] hitl  "marketing: submit taproot to awesome-claude and similar curated lists (awesome-ai-agents, awesome-llm-tools, awesome-developer-tools); write a short submission blurb for each — deferred post-v1"
3.  skipped  [refine]    hitl  agent-integration/parallel-agent-execution/usecase  "revise spec for worktree-first model: acknowledge worktree as primary path, narrow advisory locking to shared-fs edge case — deferred post-v1"
4.  pending  [implement] afk   "fix ## Tests misclassifications — aider-adapter/cli-command/impl (.aider.conf.yml → Source Files) and hook-compatibility/cli-command/impl (truth-checker.ts, adapters/index.ts → Source Files)"
5.  pending  [implement] afk   "fix guide-truth-capture/agent-skill/impl — replace /tr-define-truth test reference with actual test file path or note absence"
6.  pending  [implement] hitl  "add truths — run /tr-discover-truths to process review-all candidates (plan item glossary entry; display path / filesystem path distinction)"
7.  pending  [implement] afk   "fix stale source refs: discover-truths/skill/impl — skills/review-all.md → skills/audit-all.md (renamed)"
8.  pending  [implement] afk   "fix stale source refs: contextual-next-steps/all-skills/impl — skills/review.md → skills/audit.md, skills/review-all.md → skills/audit-all.md"
9.  pending  [implement] hitl  "fix author-design-constraints/agent-skill/impl — skills/design-constraints.md never created; mark needs-rework"
10. pending  [implement] afk   "refresh last-verified: requirements-completeness/coverage-report/cli-command/impl — coverage.ts extended this session"
11. pending  [implement] afk   "refresh last-verified: requirements-compliance/check-orphans/cli-command/impl — check-orphans.ts extended this session"
12. done     [spec]      hitl  "why/what not how — add to behaviour.md skill, intent.md skill, docs/concepts.md as framework-level principle; add format-rules.ts enforcement so it's caught at commit time for all agents"
13. done     [spec]      hitl  "agent integration anti-pattern — agent files should reference docs and hook, not define quality rules; captured as global truth in conventions_impl.md"
14. pending  [implement] afk   "fix: commithook DoR usecase-exists check doesn't accept link.md as a valid usecase substitute — update check to treat link.md as equivalent"
15. pending  [implement] afk   "fix: offline mode silent degradation — warn explicitly when falling back to TAPROOT_OFFLINE=1 (missing repos.yaml or unresolvable clone path) instead of silently continuing"
16. pending  [spec]      hitl  "spec: .taproot/ gitignore boundary — truth-check-session committed, repos.yaml per-machine; design solution (move session file to taproot/? standardise .taproot/.gitignore?)"
17. pending  [spec]      hitl  "spec: cross-repo drift detection + enforcement model — link is a point-in-time pointer with no freshness guarantee; one-directional enforcement; spec what taproot can realistically provide"
