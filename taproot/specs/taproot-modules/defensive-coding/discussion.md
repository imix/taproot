# Discussion: Activate Defensive Coding Module

## Session
- **Date:** 2026-04-16
- **Skill:** tr-behaviour (preceded by tr-explore + tr-grill-me)

## Pivotal Questions

1. **Should this sit inside the architecture module or alongside it?** Decided: peer module. The domain is large enough and the opinions vary enough per language that embedding it as an 8th architecture aspect would be reductive.

2. **How to handle the cross-language variation?** The key insight: aspects are concern-scoped (enforcement, conventions) not language-scoped. Language and optional context are parameters passed to the same aspects — producing one truth file per combination. This mirrors how the UX module handles surface type.

3. **Should the module write linter config files directly?** Decided: yes, following the security local-tooling precedent. The alternative (present a copyable snippet) was rejected because other modules already write config directly, and the developer confirms before any file is written.

## Alternatives Considered

- **Embed defensive-coding as an 8th aspect of the architecture module** — rejected: the domain is too large and language-specific opinions don't belong in a structural module
- **Pre-baked per-language sub-skills (defensive-typescript.md, defensive-python.md, etc.)** — rejected: doesn't scale to unknown stacks (e.g. Lua); agent-confidence model with research offer is more flexible
- **Separate truth files per aspect per language** (`defensive-typescript-enforcement_behaviour.md`, `defensive-typescript-conventions_behaviour.md`) — rejected: enforcement and conventions belong together for the same language context; one file per combination is easier to read

## Decision

A peer module with concern-scoped aspects (enforcement + conventions) captured in a single truth file per language × optional-context combination. The orchestrator is language-agnostic: known stacks get opinionated defaults, unknown stacks get a research offer. Error-handling is explicitly out of scope (owned by the architecture module at the propagation level); defensive-coding owns expression-level robustness — the boundary heuristic is "where would a reviewer comment?"

## Open Questions

- Which stacks to support with strong defaults in the v1 agent skill? (TypeScript is the obvious first; Go and Python likely next)
- Does the linter-config write need a merge strategy spec, or is read-check-append sufficient?
- Should the `enforcement` category include compiler flags (e.g. TypeScript `strict: true`) or only linter rules?
