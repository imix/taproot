# Discussion: Multi-Surface — Settings Gate + Skill Declarations

## Session
- **Date:** 2026-04-13
- **Skill:** tr-implement

## Pivotal Questions

**Which skills need the declaration?** Only skills that call `taproot dod --resolve` on behalf of the developer — `commit.md` (Implementation commit sub-flow) and `implement.md` (step 8/9). Skills that mention DoD in a What's next block only are out of scope per the usecase.

**Where to place the declaration in commit.md?** The Implementation commit sub-flow has an optional "N > 3" branch before DoD resolution. A single `[invoke: compress-context]` placed after the branch-decision step and before the per-impl.md resolution loop covers all paths without duplicating the declaration.

## Alternatives Considered
- **Place declaration per-branch** — rejected: the compress-context declaration before the loop already covers both the proceed-immediately path and the split path.
- **Add declaration to all skills** — rejected: the usecase explicitly limits scope to skills that run DoD resolution; overapplying would violate the spec.

## Decision
Add a single `[invoke: compress-context]` step in each of the two affected skills immediately before the DoD resolution loop. Wire the constraint via `check-if-affected-by: skill-architecture/neutral-dod-resolution` in settings.yaml scoped to `skills/*.md`, so future skill authors are automatically evaluated at DoD time.

## Open Questions
- None.
