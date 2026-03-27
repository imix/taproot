# Intent: Human Integration

## Goal
Ensure the human orchestrator retains meaningful control of the requirement hierarchy — as its owner, its primary author of intent, and its final decision-maker — while making the current state of the project legible at a glance.

## Stakeholders
- **Agentic developer / orchestrator**: needs to own, evolve, and understand the hierarchy without having to read every document or run multiple commands to get orientation
- **Project stakeholders**: need a human-interpretable view of what has been defined, what is being built, and what is complete

## Success Criteria
- The human can understand the full state of the hierarchy (coverage, gaps, drift, health) from a single report
- The human can author or modify any part of the hierarchy directly — in plain markdown, without tooling intermediaries
- The human can evolve the hierarchy incrementally: add an intent, refine a behaviour, promote a finding, without restructuring everything

## Constraints
- Human authoring must be possible with only a text editor — no GUI or proprietary tooling required
- Reporting and overview commands produce human-readable output, not just machine-readable formats
- The human retains final approval authority; agents propose, humans confirm
- The authoring lifecycle (creating intents, defining behaviours, implementing, refining) is supported by agent skills (`/tr-intent`, `/tr-behaviour`, `/tr-refine`, `/tr-promote`) documented under agent-integration — this intent covers the human-facing view (reporting, oversight, legibility)

## Behaviours <!-- taproot-managed -->
- [Cross-Linked Specs](./cross-linked-specs/usecase.md)
- [Contextual Next-Step Guidance](./contextual-next-steps/usecase.md)
- [Grill Me](./grill-me/usecase.md)
- [Generate Human-Readable Status Report](./human-readable-report/usecase.md)
- [Pause and Confirm Before Writing Each Document](./pause-and-confirm/usecase.md)
- [Route a Natural Language Requirement](./route-requirement/usecase.md)
- [Surface Relevant Patterns Before Proceeding](./pattern-hints/usecase.md)
- [Hierarchy Sweep](./hierarchy-sweep/usecase.md)
- [Bug Triage and Root Cause Analysis](./bug-triage/usecase.md)
- [Browse Hierarchy Item](./browse-hierarchy-item/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
