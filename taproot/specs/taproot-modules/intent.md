# Intent: Taproot Implementation Modules

## Stakeholders
- **Developer / team lead**: adopting taproot on a project — wants implementation quality guidance beyond requirement tracking, with consistent UX, architecture, and security conventions applied automatically by agents
- **Taproot maintainer**: shipping and evolving the module system — needs a clean extension point that doesn't bloat the core tool for projects that don't need it

## Goal

Provide optional, installable quality modules that give agents the conventions, checklists, and pattern vocabulary needed to produce consistent, domain-appropriate implementations — without requiring changes to core taproot or burdening projects that don't need a given domain.

## Success Criteria

- [ ] A team can declare which quality modules apply to their project and have agents apply the corresponding conventions automatically
- [ ] Repeated implementation mistakes (inconsistent UX patterns, missing accessibility handling, security oversights) are caught before commit, not in review
- [ ] Introducing a new quality module does not require changes to the core taproot workflow
- [ ] A project with no modules activated is not burdened by the feature
- [ ] The `user-experience` module covers orientation, flow, feedback, input, presentation, language, accessibility, adaptation, and consistency — applicable to both GUI and CLI surfaces
- [ ] Each module sub-skill elicits conventions interactively and discovers from existing code and specs
- [ ] Each sub-skill writes a scoped global truth containing conventions and a checklist agents use at DoR/DoD time
- [ ] Pattern discovery surfaces recurring UI/UX patterns worth extracting as shared components or conventions
- [ ] Activating a module optionally wires a `check-if-affected-by` DoD condition into the project configuration

## Constraints

- Module conventions must be expressible without modifying core taproot source
- Sub-skill conventions must be generic enough to apply to CLI, web, mobile, and desktop surfaces
- No hard commithook enforcement — checking is agent-driven at DoR/DoD time via global truths
- First module to validate the model: `user-experience`

## Behaviours <!-- taproot-managed -->

## Status

- **State:** active
- **Created:** 2026-04-11
- **Last reviewed:** 2026-04-11
