# Implementation: Multi-Surface — validate-format + behaviour skill + refine skill + docs

## Behaviour
../usecase.md

## Design Decisions
- `MISSING_ACCEPTANCE_CRITERIA` is a **warning** (not error) because a spec in `proposed`/`specified` state may legitimately have no impls yet — the check is gated on `hasImplChildren`, not state
- `DUPLICATE_CRITERION_ID` is an **error** because duplicate IDs break grep-based traceability; two tests referencing `AC-1` cannot be disambiguated
- ID detection uses `**AC-N:**` bold prefix pattern — this is the canonical format; bare `AC-N` elsewhere (e.g. in body text) does not count as an ID declaration
- Skills updated in both `skills/` (package source) and `taproot/agent/skills/` (installed copy); CLAUDE.md documents this copy-back step

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
- **Last verified:** 2026-04-09

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated with MISSING_ACCEPTANCE_CRITERIA and DUPLICATE_CRITERION_ID violation codes | resolved: 2026-03-19T22:32:00.969Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — Gherkin-style AC in usecase.md is a format convention, not a reusable implementation pattern | resolved: 2026-03-20T18:30:44.897Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — acceptance criteria is already enforced via the existing MISSING_ACCEPTANCE_CRITERIA validate-format check | resolved: 2026-03-20T18:30:44.657Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — checkAcceptanceCriteria() is pure validation logic in src/validators/format-rules.ts; no I/O; no global state; skill changes are markdown-only | resolved: 2026-03-20T18:30:44.418Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that receive a natural language description of intent and check docs/patterns.md; behaviour.md and refine.md are spec-authoring skills, not requirement-routing skills | resolved: 2026-03-20T18:30:44.178Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — skills/behaviour.md and skills/refine.md load resources on-demand; no heavy context loaded at skill init; description lines are concise; /compact signal present in behaviour.md footer | resolved: 2026-03-20T18:30:43.943Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to skills that write multiple documents in sequence; behaviour.md and refine.md are individual single-document skills | resolved: 2026-03-20T18:30:43.701Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this impl modifies validate-format (a CLI command) and skill files; contextual-next-steps applies to skills that produce interactive output with a What's next? block; the skills modified (behaviour.md, refine.md) already include What's next? blocks as part of their normal output | resolved: 2026-03-20T18:30:43.456Z

- condition: check-if-affected: skills/guide.md | note: guide.md lists validate-format in CLI table; no new commands to surface yet (acceptance-check is a future behaviour) — no changes needed | resolved: 2026-03-19T22:32:08.953Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts manages auto-generated sections (## Behaviours, ## Implementations); ## Acceptance Criteria is author-managed, not touched by taproot update — no changes needed | resolved: 2026-03-19T22:32:08.715Z
- condition: document-current | note: docs/concepts.md updated 2026-03-20 to add deferred state to lifecycle table — unrelated to acceptance criteria feature; docs/concepts.md is a shared general reference file | resolved: 2026-03-20

