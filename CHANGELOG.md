# Changelog

All notable changes to taproot are documented here.

<!-- entries below -->

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
