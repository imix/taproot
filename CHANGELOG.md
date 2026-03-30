# Changelog

All notable changes to taproot are documented here.

<!-- entries below -->

## [0.9.1] - 2026-03-30

### Bug Fixes
- fix: restore push failure recovery path in release skill (ce44373)

### Maintenance
- build: add `npm run release` script — version bump + commit + tag + push in one step (a6debd7)
- chore: update package-lock.json (77ad529)

## [0.9.0] - 2026-03-30

### Taproot

**New behaviours & skills**
- taproot(taproot-distribution/security-scanning/github-workflow): add security-scan workflow, report script, release gate, and tests (12b038e)
- taproot(quality-gates/commit-workflow/cli-command): implement `taproot commit` command — truth-sign + git commit in one step (de81275)
- taproot(quality-gates/batch-dod-na-resolution/cli-command): implement `--resolve-all-na` with naRules config-driven auto-resolve (2e78c32)
- taproot(quality-gates/validate-behaviour-intent-alignment/commithook-extension): add behaviour-intent alignment check to commithook (bef249f)
- taproot(global-truth-store/author-design-constraints/agent-skill): add `/tr-design-constraints` skill — structured ADR/principle/convention/external-constraint authoring (ad707e7)
- taproot(requirements-hierarchy/incremental-behaviour-implementation/agent-skill): add phased delivery convention (62faf39)
- taproot(global-truth-store/guide-truth-capture/agent-skill): add global-truths pattern entry and first-invocation guidance to define-truth (ecd26ce)
- taproot(global-truth-store/apply-truths-when-authoring/agent-skill): surface truth enforcement signal in behaviour skill (d7db0fc)
- taproot(human-integration/route-requirement/agent-skill): add scope-split gate to `/tr-ineed` for multi-goal descriptions (b1a2064)
- taproot(human-integration/contextual-next-steps): add `/tr-browse` to spec-authoring next-steps (7482984)

**Improvements**
- taproot(implementation-planning/execute-plan/agent-skill): enrich Next: prompt with behaviour title and one-line goal (f0f0cc9)
- taproot(implementation-planning/execute-plan/agent-skill): harden commit gate — mandatory `/tr-commit` before marking item done (7e02cce)
- taproot(implementation-planning/build-plan/agent-skill): add trigger phrases and plan-modify step (0fa2f57)
- taproot(requirements-hierarchy/initialise-hierarchy/cli-command): replace yaml.dump with commented settings.yaml template with inline docs (1c04caf)
- taproot(quality-gates/definition-of-ready/cli-command): improve DoR error for implemented state (efe7505)
- taproot(agent-integration/hook-compatibility/cli-command): fix hook error messages, add commit guidance to all agent adapters (b4a6fdd)
- taproot(hierarchy-integrity/validate-structure/cli-command): exclude research/ from hierarchy walker (2e78c32)

### Bug Fixes
- fix(autonomous): fix G1 truth-conflict handling and G3 AFK filter in plan-execute (488d0ec)
- fix: unpin syft/grype versions, add explicit db update step (bd1ef75)
- fix: bump semgrep 1.76.0 and grype 0.87.0 for current db schema (5d33f53)
- fix: add spec-language truth; behaviour skill uses actor-visible language in error conditions (b1a2064)
- fix: remove blogging and book-authoring presets; document poor-fit signals in concepts.md (ec2fa89)
- fix: update stale backlog.md path references (c94a74e)

### Maintenance
- refactor: move research/ into taproot/research/; update all path references (4c64811)
- docs: add plan workflow to README quick start; expand workflows.md planning section (9b026d3)
- docs: split workflows into user-facing and agent-internals docs; expand OVSX token docs (55fc5ba)
- docs: add build-time vs runtime config split pattern to patterns_impl.md (e71f95f)
- chore: add skill step emphasis convention to global-truths conventions_impl.md (7516c90)
- chore: delete deprecated documentation/ intent (25295e1)

## [0.8.9] - 2026-03-28

### Bug Fixes
- fix(project-presentation/starter-examples/bundled-templates): add examples/ to npm package files (0be3b90)

## [0.8.8] - 2026-03-28

### Taproot
- taproot(taproot-distribution/vscode-marketplace/multi-surface): complete channels/ move and README sync (d1b1928)
- taproot(taproot-distribution/vscode-marketplace/multi-surface): declare channels/ move and README sync (b8ec9c4)

### Maintenance
- spec(taproot-distribution/vscode-marketplace): refine for channels/ folder convention and README sync (d6c3e02)
- chore: add channel-folder-convention global truth and scoped DoD condition (459296d)
- ci: add test-vscode workflow — build vsix on demand without publishing (4f5db6f)

## [0.8.7] - 2026-03-28

### Bug Fixes
- fix: add contents: write permission to publish-vscode-extension job (4755c7b)

## [0.8.6] - 2026-03-28

### Bug Fixes
- fix: attach npm tarball and vsix to GitHub release assets (1ee06ff)

## [0.8.5] - 2026-03-28

### Bug Fixes
- fix: compile extension before vsce package, add repository field, ignore vsix and out/ (6594320)

## [0.8.4] - 2026-03-28

### Taproot
- taproot(taproot-distribution/vscode-marketplace/multi-surface): complete Phase 1 — lockfile, version sync, CI job, release skill (66ab6c8)

### Maintenance
- chore: update plan and overview (7724cf7)

## [0.8.3] - 2026-03-28

### Bug Fixes
- fix: replace heredoc with printf in homebrew-tap formula creation (1034909)
- fix: create Formula/taproot.rb if it does not exist in homebrew-tap (f06f85a)

## [0.8.2] - 2026-03-28

### Bug Fixes
- fix: correct GitHub owner in homebrew-tap tarball URL (imix-js → imix) (e5950ff)

## [0.8.1] - 2026-03-28

### Taproot
- taproot(taproot-distribution/homebrew-tap/ci-job): use repo-level secret, remove environment gate (ff06649)

### Bug Fixes
- fix: move taproot_version to top of settings.yaml (ed3fbb6)

## [0.8.0] - 2026-03-28

### Taproot
- taproot(quality-gates/definition-of-done/cli-command): implement step-0 dirty check gate (d881b6b)
- taproot(quality-gates/scoped-conditions/cli-extension): implement when: source-matches qualifier (f8ff324)
- taproot(quality-gates/scoped-conditions/cli-extension): declare implementation (0922458)
- taproot(skill-architecture/commit-awareness/suggest-commit-tag/agent-skill): add commit tag suggestion to /tr-commit skill (a4bea67)
- taproot(skill-architecture/commit-awareness/suggest-commit-tag/agent-skill): declare implementation (cc700f1)
- taproot(skill-architecture/commit-awareness/commit-skill/agent-skill): add document-current resolution guidance with prohibited shortcuts (2569708)
- taproot(skill-architecture/commit-awareness/commit-skill/agent-skill): What's next options after commit per AC-9 (d5888d5)
- taproot(taproot-distribution/homebrew-tap/ci-job): add update-homebrew-tap CI job to release workflow (cf15270)
- taproot(taproot-distribution/homebrew-tap/ci-job): declare implementation (0e8605e)
- taproot(taproot-distribution/ci-pipeline/github-workflow): add GitHub Actions CI workflow (5f39db0)
- taproot(taproot-distribution/ci-pipeline/github-workflow): declare implementation (35bd782)
- taproot(implementation-planning/execute-plan/agent-skill): add hitl/afk modes, orientation menu, per-item commit step (2b7a9f1)
- taproot(implementation-planning/execute-plan/agent-skill): implement plan-execute skill and adapter (96d414d)
- taproot(implementation-planning/execute-plan/agent-skill): declare implementation (fed5f4c)
- taproot(implementation-planning/analyse-plan/agent-skill): implement plan-analyse skill and adapter (74fdfe4)
- taproot(implementation-planning/build-plan/agent-skill): implement plan-build skill and adapter (bab36a9)
- taproot(implementation-planning/build-plan/agent-skill): declare implementation (b2adc10)
- taproot(implementation-planning/build-plan/agent-skill): add hitl/afk classification to plan items (a0f6f28)
- taproot(implementation-planning/build-plan/agent-skill): remove consumed backlog items after plan is written (d9abca6)
- taproot(agent-integration/generate-agent-adapter/cli-command): add taproot/agent/ stub to all example starters per AC-16 (8d5ad94)
- taproot(research/research-subject/agent-skill): replace expert gate with three-way mode selection per AC-2b (21625c3)
- taproot(human-integration/hierarchy-sweep/agent-skill): status file persistence + resume flow per AC-5/6/7 (d5ec52a)
- taproot(global-truth-store/discover-truths/skill): one-at-a-time + status file persistence per AC-10/11/12 (0d86e1e)
- taproot(requirements-hierarchy/initialise-hierarchy/cli-command): .gitignore append + npm audit in github CI workflow (d5ec52a)
- taproot(taproot-backlog/manage-backlog/agent-skill): fix backlog.md path — move from taproot/agent/ to taproot/ (235ce5f)

### Features
- feat: add execute-plan and analyse-plan behaviour specs (1133268)
- feat: add build-plan behaviour spec under implementation-planning (1f91658)

### Maintenance
- chore: mark item 23 done, update OVERVIEW.md (0f3dbac)
- chore: mark item 22 done in plan.md (024c4e5)
- chore: mark item 21 done in plan.md (0243dbe)
- chore: update plan.md and link commits across impl.md files (117cf6f)
- chore: add brand assets directory, set vscode-extension icon (82e2f0e)
- chore: expand plan to 12 items (07e1ac4)
- chore: rebuild plan — 7 items for release readiness + phased execution (f36558d)
- chore: remove implemented backlog items (81ac525)
- chore: mark plan item 15 done — CI pipeline complete (ea8db81)
- chore: update discover-truths impl.md design decisions (1fcb7cc)
- chore: link commits and update overview for backlog path fix (5cc9447)

### Other
- refactor: rename /tr-plan → /tr-next and /tr-plan-build → /tr-plan (ab29001)
- refactor: update spec cross-references for tr-plan/tr-next rename (937a0b6)
- build: add .taproot/ to .gitignore on taproot init (96c7464)
- refine(execute-plan): add hitl/afk modes, orientation menu, per-item commit, follow-on offer (8838ad8)
- refine(implementation-planning/execute-plan): add hitl/afk batch logic, orientation menu, follow-on offer (f6ffb64)
- refine(implementation-planning/build-plan): add hitl/afk classification to plan items (b1cbbc2)
- refine(implementation-planning/build-plan): remove consumed backlog items after plan is written (b3edcac)
- refine: v1.0 specify pass — 8 specs/refinements + ci-pipeline spec + batch-skill-progress truth (a864ed0)
- spec: suggest-commit-tag — derive taproot() prefix from staged impl.md paths (eb9a635)
- spec: add homebrew-tap behaviour, refine vscode-marketplace scope and brand assets (978c615)
- spec: add scoped-conditions, step-0 uncommitted-changes gate in definition-of-done (b6342d8)

## [0.7.0] - 2026-03-27

### Taproot
- taproot(hierarchy-integrity/pre-commit-enforcement/cli-command): exclude taproot/agent/ from isHierarchyFile — add regression tests (ee12b1f)
- taproot(requirements-hierarchy/initialise-hierarchy/unified-layout): implement unified taproot/ directory layout (c8d6cfd)
- taproot(requirements-hierarchy/initialise-hierarchy/unified-layout): declare implementation (34cf803)

### Features
- feat: agents use ./taproot/agent/bin/taproot — close cli wrapper gap (0f4dc31)
- feat: migrate specs hierarchy to taproot/specs/ via taproot update (0e46fe4)
- feat: add taproot/agent/bin/taproot wrapper for local-link and version-pinned hook resolution (8422be3)

### Bug Fixes
- fix: resolve DoD for needs-rework impls and verify release readiness (e422d2f)
- fix: update stale .taproot/ source paths and bump Last verified dates in specs (a387ddc)
- fix: remove stale .taproot/settings.yaml after migration in taproot update (0f7f0da)
- fix: migrate settings.yaml unconditionally in taproot update, detect taproot project by settings presence (7d5b9c0)
- fix: make adapter config refs and error messages layout-aware (8de747f)
- fix: backlog migration, examples paths, intent constraint, workflows.md (4ecf4cf)
- fix: post-review corrections for unified-layout — stale impl paths, broken link, open question (aa5d5f1)

### Maintenance
- chore: update truth-check session and backlog (d7392bf)
- chore: move OVERVIEW.md to taproot/specs/ and refresh (6282ef6)
- chore: migrate to unified taproot/ layout via taproot update (c6a6abb)
- chore: link commits and update overview for isHierarchyFile fix (2c72f36)
- chore: link commits and update overview for unified-layout impl (f898adf)

### Other
- refine: unify taproot/ directory layout — specs/, agent/, settings.yaml top-level (48ead5b)

## [0.6.0] - 2026-03-27

### Taproot
- taproot(quality-gates/impl-ordering-constraints/hook-extension): implement depends-on ordering check in DoR (f3442f7)
- taproot(quality-gates/impl-ordering-constraints): add behaviour spec for depends-on ordering constraints (c19bb8a)
- taproot(global-truths/guide-truth-capture): spec guide-truth-capture usecase (8f3db4e)
- taproot(requirements-hierarchy/initialise-hierarchy/cli-command): fail-early git check before prompts (84a6dfb)
- taproot(requirements-hierarchy/initialise-hierarchy): fail-early git check; add ux-principles truth (cbb0f50)
- taproot(requirements-hierarchy/init-domain-presets): add domain preset behaviour spec (2750c4e)
- taproot(requirements-hierarchy/init-domain-presets): set state to specified (1df97c9)
- taproot(requirements-hierarchy/init-domain-presets/cli-command): implement domain preset step in taproot init (c6a2ab1)
- taproot(project-presentation/starter-examples): collapse template prompt to single select (0c4bd37)
- taproot(project-presentation/starter-examples/bundled-templates): single select for template prompt AC-7 (3293f15)
- taproot(global-truths/enforce-truths-at-commit): declare all-levels implementation (ef7e946)
- taproot(global-truths/enforce-truths-at-commit/all-levels): extend truth check to all commit levels (68e8519)

### Bug Fixes
- fix: mark global-truths as taproot-managed; warn on intent.md in global-truths (3bf52cc)
- fix(define-truth): add Phase 3 naming guidance with category-level name suggestions (51fc977)
- fix(ineed): add global-truth pre-check before pattern-hints in step 0 (0c4bd37)
- fix: truth-sign excludes impl.md from hash to match hook validation (063ed7d)

### Maintenance
- refactor: rename global-truths feature intent to global-truth-store; clean truth store (6b49d1d)
- docs: move quick start before concepts; add enforcement model table (53aa55c)

## [0.5.1] - 2026-03-26

### Features
- feat(coverage): add --show-incomplete flag; simplify preflight script (4b804b7)

### Bug Fixes
- fix: read version from package.json instead of hardcoded string (8880931)
- fix(test): update release-skill test to match preflight.sh delegation (6f0422a)

### Maintenance
- chore: add npm run preflight script for release pre-flight checks (729431b)
- chore: update release skill to use npm run preflight (5bef103)
- chore: make --show-incomplete discoverable in release skill (3e3e28d)
- chore: disable vscode-extension CI job until extension is ready (3f362e7)
- chore: rebuild dist (cf5dae8)

## [0.5.0] - 2026-03-26

### Taproot
- taproot(global-truths/apply-truths-when-authoring/agent-skill): inject truth-loading step into authoring skills (cc7e387)
- taproot(global-truths/apply-truths-when-authoring/agent-skill): declare implementation (3484e44)
- taproot(global-truths/define-truth/agent-skill): implement define-truth as agent skill (d40f952)
- taproot(global-truths/define-truth/agent-skill): declare implementation (abc4cf9)
- taproot(global-truths): advance intent state to active, annotate SC-4 (92b10b5)
- taproot(global-truths/discover-truths/skill): link commits and update overview (0182f20)
- taproot(global-truths/discover-truths/skill): implement discover-truths as agent skill (afc95a5)
- taproot(global-truths/discover-truths/skill): declare implementation (34efd95)
- taproot(global-truths/discover-truths): add discover-truths behaviour spec (4d35125)
- taproot(project-presentation/conceptual-orientation): advance state to implemented (3dc1db7)
- taproot(project-presentation/conceptual-orientation/concepts-section): add enforcement explanation to README (70cbe29)
- taproot(project-presentation/conceptual-orientation): extend spec with enforcement model (AC-6) (f8f52e9)
- taproot(project-presentation/conceptual-orientation): advance state to implemented (0e305d3)
- taproot(project-presentation/conceptual-orientation/concepts-section): add Concepts section to README (cc83e62)
- taproot(project-presentation/conceptual-orientation/concepts-section): declare implementation (1c29d95)
- taproot(project-presentation/conceptual-orientation): link concepts-section impl (07a3df2)
- taproot(project-presentation/conceptual-orientation): refine usecase spec from review findings (4fa183e)
- taproot(global-truths/enforce-truths-at-commit/hook-extension): implement truth-check session hash and pre-commit enforcement (a091b9d)
- taproot(global-truths/enforce-truths-at-commit/hook-extension): declare implementation (43576af)
- taproot(global-truths): rename GlobalTruths/ to global-truths/ in all specs (d668c04)
- taproot(global-truths): specify define-truth, apply-truths-when-authoring, enforce-truths-at-commit (c21c246)
- taproot(taproot-distribution/vscode-marketplace/multi-surface): add VS Code extension and CI publish job (1b43978)
- taproot(taproot-distribution/vscode-marketplace/multi-surface): declare implementation (0ca60a2)
- taproot(taproot-distribution/vscode-marketplace): specify VS Code Marketplace publish behaviour (15f0573)

### Features
- feat(init): create taproot/global-truths/ with README hint; exclude from structure validation (ef23f6b)

### Maintenance
- chore: defer vscode-marketplace impl ahead of release (9d27d8c)
- chore: link commits for concepts-section impl (0b7f798)
- chore: add global-truths/ scaffold to all starter templates (e694213)
- chore: update OVERVIEW.md (3071ba8)
- chore: link commits in hook-extension impl.md (6c1bfa9)
- chore: mark vscode-marketplace impl in-progress; document remaining gaps (b941bfc)
- chore: set VS Code publisher to imix-ai (a60b1a8)
- chore: link commits for vscode-marketplace impl (8dec707)

## [0.4.0] - 2026-03-26

### Taproot

- taproot(human-integration/bug-triage/agent-skill): add step 4a recurrence check with DoR/DoD/guideline prevention and grill-me fallback (ce8113e)
- taproot(human-integration/bug-triage): extend spec with recurrence check and process gap prevention (step 4a, AC-9, AC-10) (06699a8)
- taproot(agent-integration/autonomous-execution/skill-and-config): implement autonomous mode via skill preambles + config (926b008)
- taproot(agent-integration/autonomous-execution/skill-and-config): declare implementation (5f8ce14)
- taproot(quality-gates/state-transition-guardrails/cli-command): link commits (85bc021)
- taproot(quality-gates/state-transition-guardrails/cli-command): implement evidence-backed tests-passing via test-cache + dod-runner integration (efd34fc)
- taproot(quality-gates/state-transition-guardrails/cli-command): declare implementation (048e36a)
- taproot(quality-gates/state-transition-guardrails): refine spec — fix AC-1, backward compat, commithook flow, streaming constraint (7b3384a)
- taproot(quality-gates/state-transition-guardrails,agent-integration/cli-invocation): add state-transition-guardrails spec; refine cli-invocation with dev-repo bootstrap flow (6abc39b)
- taproot(agent-integration/aider-adapter/cli-command): link commits (d34ee3e)
- taproot(agent-integration/aider-adapter/cli-command): add Aider as Tier 2 supported agent (dd21bb5)
- taproot(agent-integration/aider-adapter/cli-command): declare implementation (4ecb1aa)
- taproot(human-integration/contextual-next-steps/all-skills): link commits (a4fa534)
- taproot(human-integration/contextual-next-steps/all-skills): add /tr-backlog to What's next blocks — AC-8 and AC-9 (baf32e1)
- taproot(human-integration/contextual-next-steps): add /tr-backlog to What's next guidance (923c9bf)
- taproot(taproot-backlog/manage-backlog/agent-skill): link commits (fc97ef4)
- taproot(taproot-backlog/manage-backlog/agent-skill): strengthen AC-5 and AC-8 tests for refined triage UX (66e9565)
- taproot(taproot-backlog/manage-backlog/agent-skill): link commits (db89891)
- taproot(taproot-backlog/manage-backlog): clarify promote label and enrich analyze output (c51e3e2)

### Bug Fixes

- fix: set cli: node dist/cli.js in settings.yaml; run taproot update to propagate invocation block (da5b4c8)
- fix: pre-commit hook pins taproot version via npx @imix-js/taproot@x.y.z commithook (67984a3)
- fix: pre-commit hook uses npx --no taproot instead of bare taproot (08d53a5)

### Maintenance

- build: compile autonomous-execution changes; fix picomatch audit vulnerability; add parallel-agent research (02c8247)
- build: compile hook fix; link commits (8e24a93)
- chore: link commits across impl.md files (d595d61)

## [0.3.0] - 2026-03-25

### Taproot

**New skills**
- `/tr-browse` — read any hierarchy document section by section in the terminal, with inline editing via [M] Modify and discussion.md context surfaced at the relevant anchor (133b270, 9e44e0b)
- `/tr-backlog` — capture ideas and findings mid-session instantly; triage with numbered list and D/P/A <n> commands (f405a27, 6a124d4, f767269, 51441bd)

**Quality gates**
- `require-discussion-log` DoR condition — opt-in check that enforces `discussion.md` exists at declaration commit time (777f396)

**Starter examples**
- `taproot init --template book-authoring` and `--template cli-tool` added; webapp template expanded with deployment intent (830437b)

**Agent integration**
- CLI invocation prefix injected into all generated agent adapters so agents know to use `taproot` CLI commands directly (814237a)

**Requirements compliance**
- `record-decision-rationale` — `/tr-implement` and `/tr-behaviour` now write `discussion.md` capturing design deliberations at impl/behaviour time (f0fde19)

**Bug fixes**
- backlog triage: redisplay numbered list after each D/P/A action (51441bd)

## [0.2.1] - 2026-03-25

### Taproot
- taproot(quality-gates/architecture-compliance/multi-surface): add integration tests (d8c8257)
- taproot(quality-gates/nfr-measurability/settings-wiring): add integration tests (4381e4b)

### Maintenance
- docs: update tagline — AI-driven specs, enforced at commit time (22d581d)
- docs: use npx instead of global install in quick start (3d35ebd)
- docs: condense quick start — init to implement in half a page (ec4ea57)
- docs(demo.svg): update animation — npx init → /tr-ineed → /tr-implement → dod (a1f921e)

## [0.2.0] - 2026-03-24

### Highlights

First public release of taproot — a folder-based requirement hierarchy for AI-assisted development.

### Core capabilities

- **Requirement hierarchy** — `intent.md` / `usecase.md` / `impl.md` structure; plain Markdown, git-versioned alongside code
- **Quality gates** — Definition of Done (DoD) and Definition of Ready (DoR) enforced via pre-commit hook; configurable conditions in `.taproot/settings.yaml`
- **Agent skills** — 18 slash commands (`/tr-ineed`, `/tr-implement`, `/tr-commit`, `/tr-status`, `/tr-discover`, and more) for Claude Code (Tier 1), Gemini CLI (Tier 2), and community adapters
- **CLI validation** — `taproot validate-format`, `validate-structure`, `sync-check`, `coverage`, `check-orphans`, `acceptance-check`
- **Traceability** — `taproot link-commits` maps git history to impl.md; `taproot overview` generates a live hierarchy map for AI agents
- **Adaptability** — language pack support (non-English section headers), domain vocabulary overrides, agent-agnostic output
- **CI workflow** — provenance-attested npm publish via GitHub Actions with approval gate
