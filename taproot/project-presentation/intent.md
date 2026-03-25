# Intent: Welcoming Developer First Impression

## Goal
Enable any developer who discovers taproot to immediately understand what it is, who it's for, and why it matters — so they feel motivated to try it rather than moving on.

## Stakeholders
- First-time visitor: Developer encountering taproot on GitHub — needs to grasp the value proposition in under 60 seconds, without prior context
- Evaluator: Engineering lead or architect assessing whether to adopt taproot for their team — needs enough evidence of maturity and fit to justify the time investment
- Returning contributor: Developer revisiting after time away — needs quick orientation back into the project's purpose and current state

## Success Criteria
- [ ] A developer who has never heard of taproot reads the README and can describe what it does and who it's for
- [ ] The README surfaces the core pain point (AI coding loses context of *why* code exists) within the first screen
- [ ] A first-time visitor can complete `taproot init` using only the README — no external docs required for the happy path
- [ ] The README reflects taproot's actual maturity (45+ behaviours, agent tiers, DoD/DoR, etc.) — not just the minimal quick-start

## Constraints
- Must remain plain Markdown — no rendering tools, no build step
- Must not over-promise features that are not yet implemented

## Behaviours <!-- taproot-managed -->
- [Welcoming README](./welcoming-readme/usecase.md)
- [Starter Examples](./starter-examples/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-21
- **Last reviewed:** 2026-03-21
