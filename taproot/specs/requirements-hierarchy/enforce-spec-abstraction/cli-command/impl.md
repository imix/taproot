# Implementation: cli command

## Behaviour
../usecase.md

## Design Decisions
- Extended existing `checkUsecaseQuality` and `checkIntentQuality` functions rather than adding a new check stage — the abstraction checks are quality checks, not a separate gate.
- One failure per section — same pattern as Main Flow (`break` after first match). Flooding the developer with every occurrence would be noisy; one example communicates the issue.
- Reused `TECH_KEYWORDS` regex for all section checks — consistent vocabulary enforcement across Goal, Main Flow, Postconditions, Alternate Flows, Error Conditions, and Success Criteria.
- NFR exemption (AC-6) is implicit — Acceptance Criteria section body is not checked for tech terms (only structural AC-N entries are validated). NFR entries containing technical thresholds are not affected.
- Alternate Flows and Error Conditions checked against all non-empty lines (not just numbered steps) because these sections use sub-headings and bullet lists.

## Source Files
- `src/commands/commithook.ts` — `checkUsecaseQuality`: Postconditions tech check, Alternate Flows + Error Conditions tech check; `checkIntentQuality`: Success Criteria tech check

## Commits
- `f42dbca4667958d1ac99d3427acf1207a7784957` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — AC-1: clean spec passes; AC-4: Postconditions impl term; AC-8: Alternate Flows impl term, Error Conditions impl term; Success Criteria impl term on intent

## Status
- **State:** complete
- **Created:** 2026-04-03
- **Last verified:** 2026-04-03

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:50:45.503Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified | resolved: 2026-04-03T06:51:15.369Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — the Why/What/How rule in docs/concepts.md already covers this | resolved: 2026-04-03T06:51:15.081Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — abstraction enforcement is built into the commithook, not a configurable gate | resolved: 2026-04-03T06:51:14.792Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — extended existing quality check functions with same patterns; no new global state or I/O | resolved: 2026-04-03T06:51:14.521Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — commithook infrastructure, not a skill | resolved: 2026-04-03T06:51:14.247Z

- condition: check-if-affected: examples/ | note: not applicable — commithook enforcement, not scaffolded in examples | resolved: 2026-04-03T06:51:13.971Z

- condition: check-if-affected: docs/ | note: docs/concepts.md already covers abstraction rules. No update needed. | resolved: 2026-04-03T06:51:13.628Z

- condition: check-if-affected: src/commands/update.ts | note: not applicable — no new skill files | resolved: 2026-04-03T06:51:13.233Z

- condition: check-if-affected: package.json | note: not applicable — no new dependencies; extended existing commithook functions | resolved: 2026-04-03T06:51:12.811Z

- condition: document-current | note: Read docs/concepts.md: Why/What/How rule already documents abstraction separation. No new doc needed — enforcement is an implementation detail. | resolved: 2026-04-03T06:51:12.478Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:50:45.507Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:50:45.506Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:50:45.505Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:50:45.504Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/commands/commithook.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-04-03T06:50:45.503Z

