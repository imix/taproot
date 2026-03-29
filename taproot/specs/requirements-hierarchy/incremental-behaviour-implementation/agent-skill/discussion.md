# Discussion: Agent Skill — incremental behaviour delivery convention

## Session
- **Date:** 2026-03-29
- **Skill:** tr-implement

## Pivotal Questions

1. **Does this need code, or just docs?** The behaviour is a convention — the "implementation" is making agents reliably surface the pattern when relevant. Since `tr-behaviour` and `tr-ineed` already scan `docs/patterns.md`, adding the pattern entry there is sufficient for discovery. The only gap was that `behaviour.md`'s hardcoded signals only covered cross-cutting concerns, not phased-delivery language.

2. **Should Pattern A or B be the default?** Pattern A (sub-behaviours) was chosen as the default because it keeps the hierarchy clean — each deliverable unit has its own lifecycle, DoD gate, and state. Pattern B is explicitly supported but narrower: same-shape flows only. Defaulting to A and saying "when unsure, use A" prevents ambiguity.

## Alternatives Considered

- **New CLI command (`taproot defer-ac`)** — rejected. A command adds surface area and maintenance overhead. The convention is enforced via DoD resolutions (explicit deferral notes), which already exist. No new tool needed.
- **Mark ACs deferred in usecase.md status** — rejected. AC IDs are immutable once assigned; adding state to individual ACs would require schema changes. Deferral belongs in impl.md DoD resolutions, not in the spec itself.

## Decision

Convention-first: update `docs/patterns.md` with the pattern and signal phrases, add the signal to `behaviour.md`'s pattern-check step. No CLI or data model changes. This keeps the implementation minimal while making the convention reliably discoverable by any agent working in the hierarchy.

## Open Questions
- None
