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
- `taproot/agent/skills/behaviour.md` — installed copy of skills/behaviour.md (CLAUDE.md copy-back requirement)
- `docs/concepts.md` — NFR guidance added: NFR-N example, measurability definition, ISO 25010 taxonomy

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/acceptance-criteria.test.ts`

## Status
- **State:** complete
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — extending the criterion ID regex in checkAcceptanceCriteria() is pure validation logic; no I/O, no global state; skill additions are markdown-only; no architectural constraints violated | resolved: 2026-03-21

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated: validate-format section now mentions NFR-N alongside AC-N for DUPLICATE_CRITERION_ID; acceptance-check section updated to cover NFR-N criterion IDs; docs/concepts.md updated with NFR-N guidance and ISO 25010 taxonomy | resolved: 2026-03-21T10:57:35.798Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — NFR-N as labelled AC entries is a spec format convention documented in docs/concepts.md; it is not an implementation pattern for docs/patterns.md | resolved: 2026-03-21T10:58:24.803Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — NFR-N IDs are a format extension to an existing validator; no new cross-cutting rule needed; the existing validate-format check handles duplicate ID detection automatically | resolved: 2026-03-21T10:58:20.684Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — NFR-N ID regex extension is pure validation logic in src/validators/format-rules.ts; no I/O, no global state; skill and docs changes are markdown-only; no architectural constraints violated | resolved: 2026-03-21T10:58:15.672Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that receive a natural language description of intent and check docs/patterns.md for semantic matches; behaviour.md step 7b is a post-flow quality constraint prompt, not a routing or pattern-matching step | resolved: 2026-03-21T10:58:10.664Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — this impl touches behaviour.md (a spec-authoring skill) and validate-format (a CLI tool); commit-awareness applies to skills that read git state or reference commits during their flow; neither behaviour.md step 7b nor validate-format reads git history | resolved: 2026-03-21T10:58:03.159Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — step 7b in behaviour.md is a lightweight conversational prompt with no heavy context loading; no new resources loaded at skill init; the prompt is concise and conditional (only fires if quality constraints exist) | resolved: 2026-03-21T10:57:58.749Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to skills that write multiple documents in sequence; this impl modifies a single CLI validation function and adds a conversational step to behaviour.md; no multi-document writes without confirmation | resolved: 2026-03-21T10:57:54.060Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this impl modifies validate-format (a CLI tool) and skill/docs files; contextual-next-steps applies to interactive skills that produce a What's next? block; behaviour.md already includes a What's next? block | resolved: 2026-03-21T10:57:49.621Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md references validate-format as a CLI command but does not document individual validation rules or criterion ID formats; no new commands added | resolved: 2026-03-21T10:57:44.265Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts manages auto-generated ## Behaviours and ## Implementations sections; ## Acceptance Criteria is author-managed and not touched by taproot update | resolved: 2026-03-21T10:57:40.227Z

