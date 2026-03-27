# Discussion: Agent Skill — plan-analyse

## Session
- **Date:** 2026-03-27
- **Skill:** tr-implement

## Pivotal Questions

1. **CLI command or agent skill?** analyse-plan must read `taproot/plan.md`, locate each referenced `usecase.md`, check its state and content for open questions, and classify readiness. This requires agent reasoning to interpret spec content. A CLI could check file existence and state mechanically, but not flag "description is vague" or "open questions found". Decision: pure skill file.

2. **What depth of analysis is appropriate?** The spec says to check for vague descriptions, spec state, and dependency ordering — but leaves "open question detection" as an implementation concern. The skill uses a pragmatic heuristic: flag `?` markers, `TBD` entries, and `proposed` sub-behaviours as signals of open questions.

3. **How are dependencies detected?** The spec says "inferred by position". The skill uses a simple rule: if a `[spec]` or `[refine]` item for the same path appears earlier in the plan and is still `pending`, the downstream `[implement]` item is blocked. This avoids needing formal dependency declarations.

## Alternatives Considered

- **`taproot analyse-plan` CLI sub-command** — rejected for the same reason as build/execute: interpreting spec content for vagueness and open questions requires agent reasoning.
- **Modifying plan.md to annotate readiness** — rejected; the spec is explicit that this behaviour is read-only.

## Decision

Implemented as `skills/plan-analyse.md` with adapter `/tr-plan-analyse`. The skill produces a console readiness report without modifying any files. Dependency detection uses positional inference (earlier same-path items).

## Open Questions

- None.
