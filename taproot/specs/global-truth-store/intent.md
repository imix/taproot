# Intent: Global Truths

## Stakeholders
- **Developer**: authors and maintains truths — needs a single canonical place to record domain facts, business rules, entity definitions, and project conventions so they don't need to re-explain them in every spec
- **Agent**: reads truths when authoring or reviewing specs — needs reliable shared definitions to avoid inventing inconsistent interpretations
- **Team**: all contributors to the hierarchy — benefit from consistent terminology and shared assumptions across all specs, regardless of who wrote them

## Goal
Enable developers and agents to capture facts that are true across the project — domain concepts, business rules, entity definitions, project conventions — scoped to the hierarchy level they originate from, so that all specs share a consistent foundation and semantic drift is detected at write time and commit time.

## Success Criteria
- [ ] A developer can define a global truth at any hierarchy level (intent, behaviour, or implementation) without being constrained to a particular format or schema
- [ ] An agent authoring a spec automatically applies applicable truths — using the defined term, rule, or convention — rather than inventing its own interpretation
- [ ] Semantic drift between specs is detected and flagged: two specs that define or use the same concept differently are surfaced at write time or commit time
- [ ] Truths cascade correctly through the hierarchy: intent-level truths apply to all behaviours and implementations under that intent; behaviour-level truths apply to implementations; implementation-level truths are local *(enforced by `enforce-truths-at-commit` and `apply-truths-when-authoring` — no separate behaviour needed)*

## Constraints
- Truth content is free-form — no enforced schema; glossary, prose, tables, and bullet lists are all valid
- Cross-repo truths (shared domain model across repository boundaries) are deferred — captured in backlog

## Behaviours <!-- taproot-managed -->
- [Define Truth](./define-truth/usecase.md)
- [Apply Truths When Authoring](./apply-truths-when-authoring/usecase.md)
- [Enforce Truths at Commit](./enforce-truths-at-commit/usecase.md)
- [Discover Truths](./discover-truths/usecase.md)
- [Guide Truth Capture](./guide-truth-capture/usecase.md)
- [Author Design Constraints](./author-design-constraints/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-26
- **Last reviewed:** 2026-03-26

## Notes
- The scoping model mirrors the hierarchy itself: truths defined higher up cascade down, truths defined lower are invisible above
- "Global" in the intent name refers to project-wide scope (intent level), not literally all truths — the cascade model applies at every level
- Examples of truths: "a booking is not the same as a reservation", "prices are always exclusive of VAT", "we use Go for all backend services", "users can belong to multiple organisations"
