# Taproot Plan

_Built: 2026-03-27 — 15 items — Goal: v1.0 stability, usability, releases_

## Items

1. done     [refine]    taproot/specs/requirements-hierarchy/initialise-hierarchy/usecase.md  — init adds .taproot/ to .gitignore; CI template adds npm audit --audit-level=high
2. done     [spec]      "global-truth-store/batch-skill-progress — batch/stepwise skills write progress to .taproot/sessions/<skill>-status.md so they survive context compression; pattern mirrors plan.md for plan-execute; applies to: discover-truths, sweep"
3. done     [refine]    taproot/specs/global-truth-store/discover-truths/usecase.md  — present one discovery at a time with per-item response; save progress to .taproot/sessions/discover-truths-status.md (implement global truth from item 2)
4. done     [refine]    taproot/specs/human-integration/hierarchy-sweep/usecase.md  — save sweep progress to .taproot/sessions/sweep-status.md so it survives context compression (implement global truth from item 2)
5. done     [refine]    taproot/specs/skill-architecture/commit-awareness/commit-skill/usecase.md  — tr-commit offers contextual What's next options after committing
6. done     [refine]    taproot/specs/research/research-subject/usecase.md  — fix preamble framing: covers both expert knowledge and design assistance, not just "are you an expert?"
7. done     [refine]    taproot/specs/agent-integration/generate-agent-adapter/usecase.md  — check-if-affected: examples/ condition adds guidance about new taproot/ directories that starters should demonstrate
8. done     [spec]      taproot/specs/taproot-distribution/ci-pipeline/usecase.md  — taproot's own GitHub Actions CI: validate + audit + test on push/PR
9. done     [implement] taproot/specs/requirements-hierarchy/initialise-hierarchy/  — src/commands/init.ts: append .taproot/ to .gitignore + --with-ci github flag generating .github/workflows/taproot.yml with npm audit --audit-level=high
10. done     [implement] taproot/specs/global-truth-store/discover-truths/  — skills/discover-truths.md: one-at-a-time candidate presentation + status file write/read/delete per AC-10/11/12
11. done     [implement] taproot/specs/human-integration/hierarchy-sweep/  — skills/sweep.md: status file write/read/delete + resume flow per AC-5/6/7
12. done     [implement] taproot/specs/skill-architecture/commit-awareness/commit-skill/  — skills/commit.md: What's next options block after successful commit per AC-9
13. done     [implement] taproot/specs/research/research-subject/  — skills/research.md: replace "are you an expert?" with three-way mode selection [A]/[B]/[C] per AC-2b
14. done     [implement] taproot/specs/agent-integration/generate-agent-adapter/  — examples/: update starter project(s) to reflect current canonical taproot/ layout per AC-16
15. done     [implement] taproot/specs/taproot-distribution/ci-pipeline/  — .github/workflows/taproot-ci.yml: implement CI workflow (validate + audit + test on push/PR)
