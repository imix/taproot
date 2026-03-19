# Intent: Requirements Hierarchy

## Goal
Enable teams to capture the full requirements hierarchy — from business intent through stakeholder behaviour to system implementation — in a single, navigable, git-versioned structure.

## Stakeholders
- **Development teams**: need a shared, authoritative source of truth for why code exists and what it must do
- **Product managers / business analysts**: need to express business goals in a form that connects directly to working code
- **Systems architects**: need to trace stakeholder requirements through to system-level design decisions

## Success Criteria
- A business intent can be expressed with goal, stakeholders, success criteria, and constraints
- Each intent can have one or more observable stakeholder behaviours (usecases) with actor, flow, and postconditions
- Each behaviour can be linked to one or more system-level implementations
- The hierarchy is navigable top-down (intent → behaviour → impl) and bottom-up (impl → behaviour → intent)

## Constraints
- The filesystem is the data model — no external database or service required
- All documents are git-versioned alongside source code
- The format must be human-readable markdown, not a proprietary schema
- Agent-agnostic: the hierarchy must be consumable by any AI coding assistant

## Status
- **State:** active
- **Created:** 2026-03-19
