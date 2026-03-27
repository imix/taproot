# Taproot Plan

_Built: 2026-03-27 — 9 items — Goal: v1.0 stability, usability, releases_

## Items

1. done     [refine]    taproot/specs/requirements-hierarchy/initialise-hierarchy/usecase.md  — init adds .taproot/ to .gitignore; CI template adds npm audit --audit-level=high
2. done     [spec]      "global-truth-store/batch-skill-progress — batch/stepwise skills write progress to .taproot/sessions/<skill>-status.md so they survive context compression; pattern mirrors plan.md for plan-execute; applies to: discover-truths, sweep"
3. done     [refine]    taproot/specs/global-truth-store/discover-truths/usecase.md  — present one discovery at a time with per-item response; save progress to .taproot/sessions/discover-truths-status.md (implement global truth from item 2)
4. done     [refine]    taproot/specs/human-integration/hierarchy-sweep/usecase.md  — save sweep progress to .taproot/sessions/sweep-status.md so it survives context compression (implement global truth from item 2)
5. done     [refine]    taproot/specs/skill-architecture/commit-awareness/commit-skill/usecase.md  — tr-commit offers contextual What's next options after committing
6. done     [refine]    taproot/specs/research/research-subject/usecase.md  — fix preamble framing: covers both expert knowledge and design assistance, not just "are you an expert?"
7. done     [refine]    taproot/specs/agent-integration/generate-agent-adapter/usecase.md  — check-if-affected: examples/ condition adds guidance about new taproot/ directories that starters should demonstrate
8. done     [spec]      taproot/specs/taproot-distribution/ci-pipeline/usecase.md  — taproot's own GitHub Actions CI: validate + audit + test on push/PR
9. pending  [implement] taproot/specs/taproot-distribution/ci-pipeline/  — implement after spec (item 8) is done
