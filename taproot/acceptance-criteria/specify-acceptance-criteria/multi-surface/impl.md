# Implementation: Multi-Surface — validate-format + behaviour skill + refine skill + docs

## Behaviour
../usecase.md

## Design Decisions
- `MISSING_ACCEPTANCE_CRITERIA` is a **warning** (not error) because a spec in `proposed`/`specified` state may legitimately have no impls yet — the check is gated on `hasImplChildren`, not state
- `DUPLICATE_CRITERION_ID` is an **error** because duplicate IDs break grep-based traceability; two tests referencing `AC-1` cannot be disambiguated
- ID detection uses `**AC-N:**` bold prefix pattern — this is the canonical format; bare `AC-N` elsewhere (e.g. in body text) does not count as an ID declaration
- Skills updated in both `skills/` (package source) and `.taproot/skills/` (installed copy); CLAUDE.md documents this copy-back step

## Source Files
- `src/validators/format-rules.ts` — `checkAcceptanceCriteria()` function + wired into `validateFormat()` for behaviour docs
- `skills/behaviour.md` — step 7a: generate `## Acceptance Criteria` from flows; updated Document Format Reference
- `skills/refine.md` — preservation note for `## Acceptance Criteria` IDs
- `docs/concepts.md` — added `## Acceptance Criteria` with AC-1/AC-2/AC-3 to the `usecase.md` example

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/acceptance-criteria.test.ts`

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated with MISSING_ACCEPTANCE_CRITERIA and DUPLICATE_CRITERION_ID violation codes | resolved: 2026-03-19T22:32:00.969Z
- condition: check-if-affected: skills/guide.md | note: guide.md lists validate-format in CLI table; no new commands to surface yet (acceptance-check is a future behaviour) — no changes needed | resolved: 2026-03-19T22:32:08.953Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts manages auto-generated sections (## Behaviours, ## Implementations); ## Acceptance Criteria is author-managed, not touched by taproot update — no changes needed | resolved: 2026-03-19T22:32:08.715Z

