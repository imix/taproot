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
- Navigation of the hierarchy (top-down and bottom-up) is provided by the agent-context and project-discovery intents

## Constraints
- The filesystem is the data model — no external database or service required
- All documents are git-versioned alongside source code
- The format must be human-readable markdown, not a proprietary schema
- Agent-agnostic: the hierarchy must be consumable by any AI coding assistant
- `taproot/` contains only requirement documents (intents, behaviours, implementations); framework files (skills, config) live in `.taproot/`

## Behaviours <!-- taproot-managed -->
- [Configure Hierarchy Behaviour](./configure-hierarchy/usecase.md)
- [Initialise Hierarchy in a Project](./initialise-hierarchy/usecase.md)
- [Apply Task to Hierarchy Files](./apply-task/usecase.md)
- [Park Hierarchy Item](./park-hierarchy-item/usecase.md)
- [Apply Domain Preset During Init](./init-domain-presets/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19
