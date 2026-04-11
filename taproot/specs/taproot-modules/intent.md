# Intent: Taproot Implementation Modules

## Stakeholders
- **Developer / team lead**: adopting taproot on a project — wants implementation quality guidance beyond requirement tracking, with consistent UX, architecture, and security conventions applied automatically by agents
- **Taproot maintainer**: shipping and evolving the module system — needs a clean extension point that doesn't bloat the core tool for projects that don't need it

## Goal

Ensure that implementations produced within a taproot project consistently apply domain quality standards — for UX, architecture, security, and release — rather than leaving each developer or agent to invent conventions independently.

## Success Criteria

- [ ] A team can declare the quality domains that matter to their project and have agents apply the corresponding conventions automatically
- [ ] Repeated implementation mistakes (inconsistent UX patterns, missing accessibility handling, security oversights) are caught before commit, not in review
- [ ] Introducing a new quality domain does not require changes to the core taproot workflow
- [ ] A project with no relevant quality domains activated is not burdened by the feature

## Constraints

- Quality domain conventions must be expressible without modifying core taproot source
- First quality domain to validate the model: UX

## Status

- **State:** draft
- **Created:** 2026-04-11
- **Last reviewed:** 2026-04-11
