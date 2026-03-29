# Discussion: Agent Skill — design constraints session

## Session
- **Date:** 2026-03-29
- **Skill:** tr-implement

## Pivotal Questions

1. **One skill or four?** The spec has four sub-behaviours, each with distinct prompting. The question was whether to implement four separate skills (`/tr-record-decision`, `/tr-define-principle`, etc.) or one unified skill. Decision: one skill (`/tr-design-constraints`). Reasons: (a) developers should not need to know the format taxonomy before invoking — the skill classifies from description; (b) `define-truth.md` sets the precedent for inline sub-flows; (c) four entry points would fragment discoverability.

2. **Where does contradiction detection live?** The review of `define-truth.md` surfaced that it lacked contradiction detection. The fix was to add it to `define-truth.md`'s error conditions. The design-constraints skill inherits this naturally — it reads existing truth files before appending, which enables the contradiction check.

## Alternatives Considered

- **Four sub-skills** — rejected. See above.
- **Extend `define-truth.md`** with ADR/principle/convention/external modes — rejected. `define-truth.md` is already complex (Phase 0–5). Adding 4 new modes would make it significantly longer and harder to follow. A separate skill with a clear session framing is cleaner.
- **New CLI command (`taproot constraints`)** — rejected. Convention-only matches the pattern set by incremental-behaviour-implementation. No structural data needed; the skill writes free-form markdown to truth files.

## Decision

One new skill file implementing all four formats as inline steps, with format selection up front and agent classification from description. Signal phrases in `behaviour.md` and `ineed.md` make it discoverable without requiring developers to know the skill name. A pattern entry in `docs/patterns.md` makes it discoverable from agent pattern-check steps.

## Open Questions
- None
