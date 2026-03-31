# Taproot Plan

_Built: 2026-03-29 — v1.0 release plan — bugs + essentials only — updated 2026-03-30_
_HITL = human decision required · AFK = agent executes autonomously_

## Items

1. done     [implement] afk   "review fix: delete documentation/ intent — deprecated, zero behaviours, adds noise to coverage; redirect users to quality-gates/definition-of-done"
2. done     [implement] afk   "review fix: cascade-impl-status AC-6 is vacuous — reword to 'does not cascade when impl.md is not in complete state' (current wording tests a condition that can never occur)"
3. done     [implement] hitl  "review fix: taproot-adaptability prose contradiction — Language Support Design Decisions say prose is out of scope; Domain Vocabulary AC-1 says prose is substituted; one is wrong — resolve and update both specs"
4. done     [implement] afk   "review fix: reclassify apply-task state — usecase.md is 'specified' but contains a Finding describing a failed headless implementation; reclassify to proposed with a deferral note"
5. done     [implement] afk   "review fix: add cross-refs pause-and-confirm ↔ autonomous-execution (each ## Related should reference the other); add DoR ↔ DoD cross-refs (sequencing not documented in either spec)"
6. done     [implement] afk   "review fix: add negative AC to check-orphans — current AC-3 tests only the good case (no violations); add AC where a missing impl IS flagged as UNIMPLEMENTED_BEHAVIOUR"
7. done     [implement] afk   "review fix: document build-time vs runtime config split pattern in patterns_impl.md — implicit pattern in language-support + domain-vocabulary + skill-architecture; not captured as a reusable truth"
8. done     [implement] hitl  "implement hook-compatibility — P5 spec exists (agent-integration/hook-compatibility); fix error messages to use CLI not slash commands, add truth-sign guidance to Aider CONVENTIONS.md, update generate-agent-adapter"
9. done     [spec]      hitl  "bug: verify behaviour against parent intent at commit — agent should flag when a usecase.md references an intent whose goal it does not address"
10. dropped  [spec]      hitl  "taproot scale justification — agents complain overhead is too high for small projects; spec lighter entry paths or starter mode"
11. done     [spec]      hitl  "performance — diagnose why taproot feels slow; spec and implement improvements"
12. done     [spec]      hitl  "autonomous execution audit — verify TAPROOT_AUTONOMOUS works end-to-end; identify gaps (skill reads, commit hooks, interactive prompts that block headless runs)"
13. done     [spec]      hitl  "CLAUDE.md commit hook — assess whether the pre-commit hook in CLAUDE.md affects non-Claude agents (Cursor, Copilot, etc.); spec a fix if needed"
14. done     [implement] hitl  "move research/ folder into taproot/ — research artefacts should live inside the taproot hierarchy, not at project root"
15. done     [implement] hitl  "marketing: GitHub topic strategy — add relevant topics to the taproot repo (ai, requirements, bdd, traceability, agentic, spec, tdd)"
16. skipped  [implement] hitl  "marketing: submit taproot to awesome-claude and similar curated lists (awesome-ai-agents, awesome-llm-tools, awesome-developer-tools); write a short submission blurb for each — deferred post-v1"
17. done     [spec+impl] hitl  "friction: batch DoD resolution — taproot dod --resolve-all-na: dry-run DoD, auto-resolve all clearly NOT-APPLICABLE conditions based on impl type (e.g. skill-only changes auto-resolve contextual-next-steps, commit-awareness, etc.)"
18. done     [spec+impl] hitl  "friction: taproot commit wrapper — orchestrate git add → truth-sign → add session file → git commit in one CLI command; eliminating the manual multi-step sequence /tr-commit currently coordinates — also key to reducing autonomous mode bash surface (G6: currently requires --dangerously-skip-permissions)"
19. done     [spec+impl] hitl  "friction: DoR state-specified error UX — when usecase.md is already in 'implemented' state, suggest the fix inline (revert to specified) rather than blocking cold with a cryptic error"
20. done     [spec+impl] hitl  "ux: add /tr-browse option to spec-authoring skills — /tr-behaviour, /tr-refine, /tr-intent should offer 'browse related context' as a next step or inline option when writing/refining a spec"
21. done     [refine]    hitl  taproot/specs/implementation-planning/execute-plan/usecase.md  "enrich plan-execute item display: add usecase title and one-line goal to the Next: prompt so developer can make an informed proceed/skip decision"
22. skipped  [refine]    hitl  agent-integration/parallel-agent-execution/usecase  "revise spec for worktree-first model: acknowledge worktree as primary path, narrow advisory locking to shared-fs edge case — deferred post-v1"
23. pending  [implement] afk   "fix project-presentation/starter-examples/bundled-templates/impl — remove deleted examples/book-authoring/ from Source Files; add Notes entry recording removal"
24. pending  [implement] afk   "fix ## Tests misclassifications — aider-adapter/cli-command/impl (.aider.conf.yml → Source Files) and hook-compatibility/cli-command/impl (truth-checker.ts, adapters/index.ts → Source Files)"
25. pending  [implement] afk   "fix guide-truth-capture/agent-skill/impl — replace /tr-define-truth test reference with actual test file path or note absence"
26. pending  [implement] hitl  "add truths — run /tr-discover-truths to process review-all candidates (plan item glossary entry; display path / filesystem path distinction)"
