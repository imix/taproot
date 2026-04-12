# Intent: On-Demand Quality Audit

## Stakeholders
- **Developer / contributor**: working on specs or source code — wants to stress-test their own or others' work interactively before shipping, without waiting for a commit gate to catch problems
- **Team lead / spec author**: periodically reviews the hierarchy or codebase for drift, gaps, and convention violations — needs targeted tools that surface actionable findings, not just pass/fail signals
- **Taproot maintainer**: evolving taproot itself — needs to audit its own artefacts and source code against the same tools it ships to users

## Goal

Give developers interactive, on-demand tools to review quality at any layer — taproot artefacts (intents, behaviours, implementations) and source code — through targeted challenge sets and convention checks. All reviews are advisory and developer-driven, not automated gates.

## Success Criteria

- [ ] A developer can audit any single taproot artefact and receive categorised findings (Blocker / Concern / Suggestion) with proposed fixes
- [ ] A developer can audit an entire hierarchy subtree and receive a consolidated cross-cutting report covering structural issues, coverage gaps, and per-artefact findings
- [ ] A developer can review source code against behaviour-scoped global truths using a free-form prompt describing what to check and which files to target
- [ ] All review tools surface findings interactively — the developer triages each finding; nothing is silently applied or blocked
- [ ] When no relevant conventions exist for a requested subject, the tool redirects to the appropriate `/tr-<module>-define` skill rather than running with nothing to check

## Constraints

- No commit gate integration — all tools are advisory and developer-initiated; enforcement belongs in `quality-gates/`
- Reviews must not require a full project build or test run to run

## Behaviours <!-- taproot-managed -->
- [Audit a Single Artefact](./audit/usecase.md)
- [Audit an Entire Hierarchy Subtree](./audit-all/usecase.md)
- [Audit Source Code Against Conventions](./code-audit/usecase.md)

## Status
- **State:** draft
- **Created:** 2026-04-12
- **Last reviewed:** 2026-04-12
