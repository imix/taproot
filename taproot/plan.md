# Taproot Plan

_Built: 2026-03-27 — 12 items — Goal: release readiness (VS Code, release channels, docs, DoD quality, plan execution)_

## Items

1. pending  [implement] taproot/specs/taproot-distribution/vscode-marketplace/ — finish VS Code extension: extract icon from taproot_logos.zip, generate package-lock.json, update release skill, replace publisher placeholder; icons available in taproot_logos.zip
2. pending  [spec]      "other release channels — spec taproot-distribution behaviour(s) for GitHub Releases, Cursor marketplace, Homebrew, etc.; decide which channels to target for v1.0"
3. pending  [refine]    taproot/specs/taproot-distribution/vscode-marketplace/usecase.md — impl is 'deferred'; refine spec to confirm scope and unblock implementation
4. pending  [spec]      "configurable plan execution phases — extend /tr-plan-execute with a phase-mode strategy: developer configures which phases (spec / refine / implement) run interactively (HITL) and which run autonomously (AFK). Default: spec+refine = HITL, implement = AFK. Configurable per-run via flag or via taproot/settings.yaml."
5. pending  [implement] "docs/workflows.md — add detailed sections on planning workflow (/tr-plan-build, /tr-plan-execute, /tr-plan-analyse) and backlog management (/tr-backlog, taproot/backlog.md lifecycle)"
6. pending  [spec]      "fix document-current DoD check — agent incorrectly resolves 'nothing in backlog → docs don't need updating'; correct check: agent reads docs/ and compares against recent impl changes, not infers from backlog state"
7. pending  [spec]      "global-truth DoD/DoR compression — investigate whether recurring DoD/DoR check patterns (e.g. check-if-affected-by: X appearing across many impls) can be expressed as global-truths and checked automatically, reducing per-impl boilerplate"
8. pending  [spec]      "/tr-plan vs /tr-plan-build naming confusion — /tr-plan extracts the next single implementable slice; /tr-plan-build builds a multi-item roadmap; names don't signal this distinction; investigate rename (e.g. /tr-plan → /tr-plan-next or /tr-next-slice)"
9. pending  [spec]      "boilerplate scaffolding — taproot scaffold <usecase-path>: generate impl.md, stub source file, and stub test file from a usecase.md; reduces manual setup friction for each new implementation"
10. pending  [spec]      "shell script DoD/DoR conditions — add run: <script> condition type to settings.yaml so teams can run custom validation scripts as part of DoD/DoR gates, alongside existing agent checks"
11. pending  [spec]      "uncommitted changes gate in DoD/DoR — when running DoD/DoR, detect other uncommitted changes in the working tree and prompt developer to commit or stash them first; prevents incomplete state from polluting an implementation commit"
12. pending  [spec]      "commit message auto-tagging — when staging files tracked by an impl.md, suggest the taproot(intent/behaviour/impl): tag format based on the staged file paths; reduces friction of remembering the tag convention"
