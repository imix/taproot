# Intent: Accurate, Up-to-Date Documentation

## Stakeholders
- Package user: Developer installing and using the taproot npm package — needs reliable documentation to understand what the tool does and how to use it
- Contributor: Developer contributing to the taproot codebase — needs accurate docs to understand scope and avoid duplication
- Integrator: Team embedding taproot into a pipeline or toolchain — needs stable, trustworthy reference material

## Goal
Keep all taproot documentation accurate and current so that users, contributors, and integrators always have reliable information about what the tool does and how to use it. Documentation should be generated or validated automatically wherever possible, so it cannot drift silently from the actual implementation.

## Success Criteria
- [ ] The taproot README accurately reflects all implemented CLI commands, skills, and configuration options
- [ ] Documentation is auto-generated or auto-synced from the codebase — no manual update step required to keep it current
- [ ] A new user can install taproot and complete first-time setup using only the README
- [ ] Documentation gaps or drift are surfaced automatically (e.g. in CI) rather than discovered by users

## Constraints
- Documentation must be generated from authoritative sources (code, taproot hierarchy) — not maintained as a separate manual artifact
- Must remain readable without any special tooling (plain Markdown)

## Status
- **State:** deprecated
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19

## Notes
Deprecated — documentation currency is now enforced through the `document-current` DoD condition in `quality-gates/definition-of-done`. The goal of keeping docs accurate remains valid but is fulfilled there, not as a standalone intent.
