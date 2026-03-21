# Research: NFRs in BDD

**Topic:** How Non-Functional Requirements are handled in Behaviour-Driven Development
**Context:** Informing how taproot should formalise NFR handling in its spec format
**Created:** 2026-03-21

---

## Local sources
- `docs/concepts.md` — `intent.md` has `## Constraints` (no NFR label or guidance); ACs treated uniformly
- `taproot/acceptance-criteria/intent.md` — AC system is purely functional in framing; no quality attribute distinction
- `taproot/quality-gates/` — covers process gates (DoD/DoR), not quality attribute requirements

## Web sources
- *Using BDD for Non-Functional Requirements* (https://www.mdpi.com/2674-113X/3/3/14) — BDD can express NFRs as Given/When/Then with measurable thresholds, mapped to ISO 25010 characteristics; adoption gap: POs rarely backlog NFR stories
- *Effective Gherkin Acceptance Criteria* (https://testquality.com/how-to-write-effective-gherkin-acceptance-criteria/) — quality lenses: constraints, performance, UX, volatility; each mapped to isolated scenarios
- *NFRs as source of cross-cutting concerns* (https://www.researchgate.net/publication/334070334_Using_Non-Functional_Requirements_to_Identify_Cross-Cutting_Concerns) — architectural quality attributes (security, performance, reliability) cannot be localised to a single use case; require separate specification
- *ISO 25010* (https://iso25000.com/en/iso-25000-standards/iso-25010) — canonical taxonomy: performance efficiency, reliability, security, compatibility, maintainability, portability, interaction capability, functional suitability

## Expert insights
- None gathered

## Key conclusions
1. **Two fundamentally different NFR types** require different homes in a spec hierarchy:
   - **Local NFR** — quality constraint on one specific behaviour (e.g. "search returns in < 2s"). Belongs as a measurable `**AC-N:**` in `usecase.md`. Already supported in taproot — just needs explicit guidance.
   - **Cross-cutting NFR** — quality constraint spanning many behaviours (e.g. "all endpoints must handle 500 RPS", "all forms must meet WCAG 2.1 AA"). Has no explicit home in taproot today. Maps naturally to a `quality-gates/` behaviour spec + `check-if-affected-by` in settings.yaml.

2. **`intent.md` already has `## Constraints`** — this section covers cross-cutting NFRs at the intent level (e.g. "must not reveal email existence"). But it's unlabelled as NFR, has no guidance on measurability, and isn't enforced downstream.

3. **ISO 25010 is the established taxonomy** — performance, reliability, security, maintainability, portability, compatibility, interaction capability. Taproot doesn't need to invent a taxonomy; it should reference this.

4. **The enforcement gap is the real problem** — local NFRs can be written today but nothing prevents them from being vague. Cross-cutting NFRs need the `check-if-affected-by` mechanism to be enforced at all.

5. **Measurability is the distinguishing mark of a good NFR** — "must be fast" is not an NFR; "must return in < 500ms at p95 under 100 concurrent users" is. Taproot's validation rules could check for quantitative terms in NFR-labelled ACs.

## Open questions
- Should taproot introduce an `## NFR` or `## Quality Attributes` section in `usecase.md`, or is labelling certain ACs as `**NFR-1:**` sufficient?
- Should cross-cutting NFRs live under `quality-gates/` (alongside DoD/DoR) or under a new top-level `quality-attributes/` intent?
- Does taproot need to validate measurability of NFR ACs, or is guidance enough?

## References
- Using BDD for Non-Functional Requirements — https://www.mdpi.com/2674-113X/3/3/14 (accessed 2026-03-21)
- Effective Gherkin Acceptance Criteria — https://testquality.com/how-to-write-effective-gherkin-acceptance-criteria/ (accessed 2026-03-21)
- NFRs as Cross-Cutting Concerns — https://www.researchgate.net/publication/334070334_Using_Non-Functional_Requirements_to_Identify_Cross-Cutting_Concerns (accessed 2026-03-21)
- ISO 25010 Quality Characteristics — https://iso25000.com/en/iso-25000-standards/iso-25010 (accessed 2026-03-21)
