# Discussion: Skill

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

1. **Should dismissed candidates live in a separate suppression file, or reuse `.taproot/backlog.md`?**
   The usecase spec says dismissed candidates are recorded as "reviewed — not a truth: `<term>`" in `.taproot/backlog.md`. Using a separate file (e.g. `.taproot/dismissed-truths.md`) would be more explicit, but the spec is clear — the backlog is the single home for deferred and dismissed items. Reusing backlog.md avoids a new file and keeps tooling simple.

2. **Does this need new CLI support, or is agent prose sufficient?**
   The entire behaviour — scanning files, pattern-matching, presenting candidates — is reasoning work best done by the agent. No CLI command could usefully pre-scan candidates without running an LLM. The skill file is the implementation; there is no meaningful TypeScript to write.

3. **How tightly should the review-all integration be coupled?**
   The usecase says discovery runs as a "final pass" after review-all. Adding it as a discrete new step in review-all (step 7) keeps the coupling explicit and documented without tangling the discovery logic into the existing review steps.

## Alternatives Considered

- **Separate suppression file for dismissed truths** — rejected because the spec explicitly uses backlog.md; deviating would require a spec change first.
- **New CLI `taproot discover-truths` command** — rejected because candidate detection requires semantic reasoning the agent provides natively; a CLI wrapper would just invoke the skill anyway.
- **Inline discovery logic in review-all** — rejected because the usecase treats standalone invocation and review-all integration as equal paths; a separate skill file makes standalone use clean.

## Decision

Implemented as a pure skill file (`skills/discover-truths.md`) with a lightweight additive extension to `review-all.md`. The skill encodes all scan, filter, batch-present, and route logic as agent-executable prose steps. Dismissed suppression reuses `.taproot/backlog.md` as specified. The review-all integration appends a `## Truth Candidates` section after the existing report and defers unprocessed candidates to backlog automatically.

## Open Questions
- None.
