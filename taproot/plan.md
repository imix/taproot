# Taproot Plan

_Built: 2026-03-27 — 23 items — Goal: release readiness (VS Code, release channels, docs, DoD quality, plan execution)_

## Items

1. pending  [implement] taproot/specs/taproot-distribution/vscode-marketplace/ — finish VS Code extension: extract icon from taproot_logos.zip, generate package-lock.json, update release skill, replace publisher placeholder; icons available in taproot_logos.zip
2. done     [spec]      "other release channels — spec taproot-distribution behaviour(s) for GitHub Releases, Cursor marketplace, Homebrew, etc.; decide which channels to target for v1.0"
3. done     [refine]    taproot/specs/taproot-distribution/vscode-marketplace/usecase.md — impl is 'deferred'; refine spec to confirm scope and unblock implementation
4. skipped  [spec]      "configurable plan execution phases — covered by hitl/afk labels + orientation menu in execute-plan"
5. done     [spec]      "docs structure — decided: two files: docs/workflows.md (developer-facing) + docs/skills.md (skill authoring, step sequences, agent patterns)"
6. pending  [implement] "docs/workflows.md — developer-facing: add planning workflow (/tr-plan-build, /tr-plan-execute, /tr-plan-analyse) and backlog management (/tr-backlog, taproot/backlog.md lifecycle); create docs/skills.md with skill authoring guide (step sequences, context-engineering, pause-and-confirm, agent patterns)"
7. done     [spec]      "fix document-current DoD check — agent incorrectly resolves 'nothing in backlog → docs don't need updating'; correct check: agent reads docs/ and compares against recent impl changes, not infers from backlog state"
8. done     [spec]      "global-truth DoD/DoR compression — specced as scoped-conditions: when: source-matches: glob qualifier on DoD/DoR conditions; auto-resolves not-applicable for non-matching impls"
9. done     [spec]      "/tr-plan vs /tr-plan-build naming confusion — decided: rename /tr-plan → /tr-next (short, unambiguous, distinct from plan-* family)"
10. skipped  [spec]      "boilerplate scaffolding — skipped: /tr-implement already handles this end-to-end"
11. skipped  [spec]      "shell script DoD/DoR conditions — already implemented: run: <script> condition type exists in DoD spec and settings.yaml"
12. done     [spec]      "uncommitted changes gate in DoD/DoR — added step 0 to DoD flow: detect out-of-scope changes, offer [C] Commit first / [S] Stash / [I] Ignore / [A] Abort"
13. done     [spec]      "commit message auto-tagging — when staging files tracked by an impl.md, suggest the taproot(intent/behaviour/impl): tag format based on the staged file paths; reduces friction of remembering the tag convention"
24. done     [implement] afk   taproot/specs/skill-architecture/commit-awareness/suggest-commit-tag/ — implement commit tag suggestion in /tr-commit skill: derive taproot() prefix from matched impl.md paths, collapse to behaviour level when multiple impls staged, offer split when multi-intent
14. pending  [implement] taproot/specs/global-truth-store/guide-truth-capture/ — add global-truths pattern entry to taproot/agent/docs/patterns.md (five truth type categories with scope + examples); update define-truth skill to surface guidance on first invocation
15. pending  [implement] "add missing tests — 5 impls have no test coverage: agent-integration/agent-agnostic-language/settings-wiring, project-presentation/conceptual-orientation/concepts-section, project-presentation/welcoming-readme/content, requirements-hierarchy/configure-hierarchy/yaml-config, taproot-distribution/ci-pipeline/github-workflow"
16. pending  [implement] "docs: plan feature as selling point — add plan workflow to docs/quick-start.md (introduce /tr-plan-build, /tr-plan-execute, orientation menu, HITL/AFK two-pass); add 'Planning a batch of work' end-to-end workflow to docs/workflows.md"
17. pending  [implement] "marketing: submit taproot to awesome-claude and similar curated lists (awesome-ai-agents, awesome-llm-tools, awesome-developer-tools); write a short submission blurb for each"
18. pending  [implement] "marketing: create a GitHub topic strategy — add relevant topics to the taproot repo (ai, requirements, bdd, traceability, agentic, spec, tdd) to surface in GitHub topic searches"
19. done     [implement] afk   taproot/specs/taproot-distribution/homebrew-tap/ — implement Homebrew formula + CI update job
20. done     [implement] afk   "update skills/commit.md — add explicit document-current resolution guidance: read docs/ content, compare against git diff, prohibited shortcuts listed; mirrors the spec prohibition"
21. pending  [implement] afk   taproot/specs/quality-gates/scoped-conditions/ — implement when: source-matches: glob qualifier in taproot dod CLI; auto-resolve non-matching scoped conditions
22. pending  [implement] afk   "rename commands: /tr-plan → /tr-next, /tr-plan-build → /tr-plan; update .claude/commands/, skills/, guide.md, docs/agents.md, all cross-references in specs and docs"
23. pending  [implement] afk   taproot/specs/quality-gates/definition-of-done/ — implement step 0 uncommitted changes gate in taproot dod CLI: git status diff, out-of-scope detection, [C]/[S]/[I]/[A] prompt
