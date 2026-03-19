# Intent: Human Integration

## Goal
Keep the human orchestrator in meaningful control of the requirement hierarchy — as its owner, its primary author of intent, and its final decision-maker — while making the current state of the project legible at a glance.

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

## Status
- **State:** active
- **Created:** 2026-03-19
