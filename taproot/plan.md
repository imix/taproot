# Taproot Plan

_v1.1 released 2026-04-09 · v1.2 planning started 2026-04-09_
_HITL = human decision required · AFK = agent executes autonomously_

## v1.2

### spec drift

S1. done     [refine]    hitl  "taproot-distribution/cut-release/multi-surface — review impl against updated usecase.md (SPEC_UPDATED)"
S2. done     [refine]    hitl  "taproot-distribution/homebrew-tap/ci-job — review impl against updated usecase.md (SPEC_UPDATED)"
S3. done     [explore]   hitl  "discover-existing-project — explore global-truths orientation phase before refining spec (feeds B1)"

### bug fixes

B1. dropped  [refine]    hitl  "discover-existing-project — add global-truths orientation phase: route facts/rules/conventions to taproot/global-truths/ instead of forcing into intents" — already implemented as Phase 1.5 in skills/discover.md
B2. dropped  [implement] afk   "discover-existing-project/agent-skill/ — implement global-truths routing step in /tr-discover skill" — already implemented as Phase 1.5 in skills/discover.md
B3. done     [refine]    hitl  "route-requirement — add AC: when tr-behaviour input describes a global truth, detect and redirect to /tr-define-truth before proceeding"
B4. done     [implement] afk   "route-requirement/agent-skill/ — implement global truth detection in /tr-behaviour skill"
B5. done     [implement] afk   "abbreviated paths sweep — fix all What's next skill output blocks to strip taproot/specs/ prefix and .md extension per ux-principles truth"

### quality gate fixes

Q1. done     [implement] afk   quality-gates/validate-intent-quality/multi-surface/ — SPEC_UPDATED: implement Success Criteria tech-term check and up-contamination warning
Q2. done     [implement] afk   quality-gates/architecture-compliance/multi-surface/ — IMPL_STALE: verify impl against settings.yaml drift, update Last verified
Q3. pending  [implement] afk   quality-gates/nfr-measurability/settings-wiring/ — IMPL_STALE: verify impl against settings.yaml drift, update Last verified
Q4. pending  [refine]    hitl  quality-gates/validate-usecase-quality/usecase — add tech-term check in AC/flow steps (down-contamination); parallel to validate-intent-quality
Q5. pending  [refine]    hitl  quality-gates/validate-behaviour-intent-alignment/usecase — deepen alignment checks beyond structural parent-intent check

## deferred

D1. deferred [spec]      hitl  "full DAG cycle detection — extend check-orphans to traverse multi-hop link chains"
D2. deferred [refine]    hitl  "agent-integration/parallel-agent-execution/ — align spec with worktree isolation model before any implementation begins"
D3. deferred [spec]      hitl  "work claiming — atomic claim of plan items via .taproot/claims/ directory; one file per item; prevents collision"
D4. deferred [spec]      hitl  "agent identity in the record — impl.md, DoD resolutions, and plan.md record which agent (name/role) authored each change"
D5. deferred [spec]      hitl  "handoff protocol — spec-writing agent signals impl agent when a spec reaches 'specified'; mechanism TBD (inbox file, claims state)"
D6. deferred [spec]      hitl  "semantic conflict resolution — detect and surface spec-meaning conflicts when two agents modify the same usecase.md concurrently"
D7. deferred [spec]      hitl  "coordinator skill (tr-assign) — routes plan items to agents by role; depends on work claiming and handoff protocol"
