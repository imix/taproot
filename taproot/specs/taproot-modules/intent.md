# Intent: Taproot Implementation Modules

## Stakeholders
- **Developer / team lead**: adopting taproot on a project — wants implementation quality guidance beyond requirement tracking, with consistent UX, architecture, and security conventions applied automatically by agents
- **Taproot maintainer**: shipping and evolving the module system — needs a clean extension point that doesn't bloat the core tool for projects that don't need it
- **Agent**: executing implementations — consumes module conventions and checklists from global truth files; needs them discoverable at DoR/DoD time without explicit instruction

## Goal

Provide optional, installable quality modules that give agents the conventions, checklists, and pattern vocabulary needed to produce consistent, domain-appropriate implementations — without burdening projects that don't need a given domain.

## Success Criteria

- [ ] A team can declare which quality modules apply to their project; `taproot update` installs only those modules' skills — no undeclared module skills appear in the project
- [ ] An agent working on a feature that touches a module's domain uses the module's checklist at DoR/DoD time without being explicitly reminded — the convention is applied automatically through the global truth mechanism
- [ ] Introducing a new quality module does not require changes to the core taproot workflow
- [ ] A project with no modules declared has no module skill files installed by `taproot update` — the working tree is not affected
- [ ] Activating a module optionally wires a `check-if-affected-by` DoD condition into the project configuration
- [ ] Each module's conventions and agent checklists are discoverable and applicable without reading the module's source code
- [ ] After any module sub-skill writes a truth file, the developer is offered the option to run `/tr-sweep` to surface existing code that may not conform to the newly defined conventions

## Constraints

- The module declaration mechanism must be expressible through `taproot/settings.yaml` without requiring projects to modify their agent configuration files; core taproot CLI may be updated to support module declarations
- Sub-skill conventions must be generic enough to apply to CLI, web, mobile, and desktop surfaces
- No hard commithook enforcement — checking is agent-driven at DoR/DoD time via global truths
- First module to validate the model: `user-experience`

## Behaviours <!-- taproot-managed -->
- [Activate UX Module](./user-experience/usecase.md)
- [Module Installation Opt-In](./module-install-opt-in/usecase.md)
- [Module Context Discovery](./module-context-discovery/usecase.md)

## Status

- **State:** active
- **Created:** 2026-04-11
- **Last reviewed:** 2026-04-11
