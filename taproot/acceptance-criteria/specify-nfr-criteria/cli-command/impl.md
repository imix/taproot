# Implementation: validate-format + behaviour skill + docs

## Behaviour
../usecase.md

## Design Decisions
- `NFR-N` IDs use the same detection pattern as `AC-N` but with a distinct prefix — regex extended to `/^\*\*(AC|NFR)-(\d+):/gm` so both prefixes share the same duplicate-ID check
- NFR-N and AC-N share the same `## Acceptance Criteria` section; there is no separate `## NFR Criteria` section — this keeps all testable criteria in one place for traceability
- ISO 25010 referenced as an optional vocabulary in docs/concepts.md — not enforced by tooling; subjective category labels are not measurable and therefore out of scope for validate-format checks
- `NFR-N` IDs start their own sequence independently from AC-N (NFR-1 is not the same as AC-1); duplicate check is scoped within each prefix namespace
- skills/behaviour.md step 7b prompts for quality constraints after functional ACs — prompt is conversational (asks the author) not prescriptive (does not require NFR entries to be present)

## Source Files
- `src/validators/format-rules.ts` — `checkAcceptanceCriteria()`: pattern extended to recognize `NFR-N` IDs
- `skills/behaviour.md` — step 7b added: prompt for quality constraints and derive NFR-N entries
- `.taproot/skills/behaviour.md` — installed copy of skills/behaviour.md (CLAUDE.md copy-back requirement)
- `docs/concepts.md` — NFR guidance added: NFR-N example, measurability definition, ISO 25010 taxonomy

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/acceptance-criteria.test.ts`

## Status
- **State:** in-progress
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — extending the criterion ID regex in checkAcceptanceCriteria() is pure validation logic; no I/O, no global state; skill additions are markdown-only; no architectural constraints violated | resolved: 2026-03-21
