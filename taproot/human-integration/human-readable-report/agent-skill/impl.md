# Implementation: Agent Skill — /tr-status

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an agent skill that combines multiple CLI commands rather than as a single CLI command — the synthesis, prioritization, and narrative framing benefit from agent reasoning
- The skill defines a fixed output format with clear sections (Validation, Coverage, What's Working, What Needs Attention, Parked, Suggested Next Actions) so the report is predictable and skimmable
- Parked section sources from `deferredBehaviours`/`deferredImpls` in coverage JSON; omitted entirely when both are zero so the report stays clean for projects with no deferred items

## Source Files
- `skills/status.md` — full skill definition including report format and prioritization rules

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/unit/skills.test.ts` — validates skill file format, required sections, and Parked section content (AC-1: deferredBehaviours/deferredImpls referenced, ## Parked template present; AC-2: omit-when-zero instruction present)

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-20

## DoD Resolutions
- condition: document-current | note: skills/status.md updated with Parked section in report template; guide.md describes /tr-status at a high level only (no report sections listed) — no change needed; docs/agents.md lists /tr-status as a coverage dashboard — no section-level detail to update | resolved: 2026-03-20T18:33:53.194Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — surfacing deferred items in a status report is specific behaviour, not a reusable pattern | resolved: 2026-03-20T18:33:55.296Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot.yaml? | note: no — Parked section is a reporting addition to one skill; not a cross-cutting enforcement concern | resolved: 2026-03-20T18:33:55.063Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — change is markdown-only (skills/status.md); no source code modified; no architectural constraints affected | resolved: 2026-03-20T18:33:54.834Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that process natural language requirements; tr-status processes CLI command output, not user intent descriptions | resolved: 2026-03-20T18:33:54.602Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: compliant — status.md loads CLI output on-demand via explicit taproot commands in Steps; description is concise; no pre-loaded heavy context; /compact signal present in skill footer | resolved: 2026-03-20T18:33:54.372Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — tr-status is a read-only skill that produces a single report; it does not write multiple documents in sequence | resolved: 2026-03-20T18:33:54.135Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: compliant — status.md already ends with a What's next? block presenting lettered options; Parked section is a new report section, not an output endpoint; no change to the What's next? structure required | resolved: 2026-03-20T18:33:53.889Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md lists /tr-status as a health dashboard command but does not enumerate report sections; Parked section addition requires no change to the onboarding guide | resolved: 2026-03-20T18:33:53.659Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts copies skill files to agent adapter directories; the Parked section addition to status.md is propagated via the CLAUDE.md copy-back step, not via update.ts | resolved: 2026-03-20T18:33:53.424Z
- condition: document-current | note: skills/status.md step 1 updated to explicitly name deferredBehaviours and deferredImpls JSON fields for Parked section population; no other docs require updating | resolved: 2026-03-20T19:00:00.000Z

