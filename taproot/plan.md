# Taproot Plan

_Built: 2026-03-29 — v1.0 release plan — bugs + essentials only — updated 2026-03-29_
_HITL = human decision required · AFK = agent executes autonomously_

## Items

1. done     [spec]      hitl  "bug: verify behaviour against parent intent at commit — agent should flag when a usecase.md references an intent whose goal it does not address"
2. dropped  [spec]      hitl  "taproot scale justification — agents complain overhead is too high for small projects; spec lighter entry paths or starter mode"
3. pending  [spec]      hitl  "performance — diagnose why taproot feels slow; spec and implement improvements"
4. pending  [spec]      hitl  "autonomous execution audit — verify TAPROOT_AUTONOMOUS works end-to-end; identify gaps (skill reads, commit hooks, interactive prompts that block headless runs)"
5. pending  [spec]      hitl  "CLAUDE.md commit hook — assess whether the pre-commit hook in CLAUDE.md affects non-Claude agents (Cursor, Copilot, etc.); spec a fix if needed"
6. pending  [implement] hitl  "move research/ folder into taproot/ — research artefacts should live inside the taproot hierarchy, not at project root"
7. pending  [implement] hitl  "marketing: GitHub topic strategy — add relevant topics to the taproot repo (ai, requirements, bdd, traceability, agentic, spec, tdd)"
8. pending  [implement] hitl  "marketing: submit taproot to awesome-claude and similar curated lists (awesome-ai-agents, awesome-llm-tools, awesome-developer-tools); write a short submission blurb for each"
9. pending  [spec+impl] hitl  "friction: batch DoD resolution — taproot dod --resolve-all-na: dry-run DoD, auto-resolve all clearly NOT-APPLICABLE conditions based on impl type (e.g. skill-only changes auto-resolve contextual-next-steps, commit-awareness, etc.)"
10. pending  [spec+impl] hitl  "friction: taproot commit wrapper — orchestrate git add → truth-sign → add session file → git commit in one CLI command; eliminating the manual multi-step sequence /tr-commit currently coordinates"
11. pending  [spec+impl] hitl  "friction: DoR state-specified error UX — when usecase.md is already in 'implemented' state, suggest the fix inline (revert to specified) rather than blocking cold with a cryptic error"
