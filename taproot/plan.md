# Taproot Plan

_Built: 2026-03-28 — 11 items — Goal: distribution, docs, marketing, scale_
_HITL = human decision required · AFK = agent executes autonomously_

## Items

1. done     [implement] hitl  taproot/specs/taproot-distribution/vscode-marketplace/ — finish VS Code extension: icon, package-lock.json, publisher placeholder, release skill update
2. done     [implement] hitl  "docs/workflows.md + docs/skills.md — add planning workflow (/tr-plan, /tr-plan-execute, /tr-plan-analyse) and backlog management; create docs/skills.md with skill authoring guide (step sequences, context-engineering, pause-and-confirm, agent patterns)"
3. done     [implement] afk   taproot/specs/global-truth-store/guide-truth-capture/ — add global-truths pattern entry to taproot/agent/docs/patterns.md; update define-truth skill to surface guidance on first invocation
4. done     [implement] afk   "add missing tests — 5 impls have no test coverage: agent-integration/agent-agnostic-language/settings-wiring, project-presentation/conceptual-orientation/concepts-section, project-presentation/welcoming-readme/content, requirements-hierarchy/configure-hierarchy/yaml-config, taproot-distribution/ci-pipeline/github-workflow"
5. pending  [implement] hitl  "docs: plan feature as selling point — add plan workflow to docs/quick-start.md; add 'Planning a batch of work' end-to-end workflow to docs/workflows.md"
6. pending  [implement] hitl  "marketing: submit taproot to awesome-claude and similar curated lists (awesome-ai-agents, awesome-llm-tools, awesome-developer-tools); write a short submission blurb for each"
7. pending  [implement] hitl  "marketing: GitHub topic strategy — add relevant topics to the taproot repo (ai, requirements, bdd, traceability, agentic, spec, tdd)"
8. pending  [implement] hitl  "rename npm package — @imix-js/taproot is JS-specific; consider @imix-ai/taproot or unscoped taproot"
9. pending  [spec]      hitl  "taproot scale justification — agents complain overhead is too high for small projects; spec lighter entry paths or starter mode"
10. pending  [spec]      hitl  "performance — diagnose why taproot feels slow; spec and implement improvements"
11. pending  [spec]      hitl  "GitHub Actions PR bot — impact reports on PRs: this PR modifies files linked to behaviour X, spec stale since..."
12. pending  [implement] hitl  "move research/ folder into taproot/ — research artefacts should live inside the taproot hierarchy, not at project root"
