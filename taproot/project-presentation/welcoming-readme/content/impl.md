# Implementation: README Content

## Behaviour
../usecase.md

## Design Decisions
- Pain point hook opens the README — the first sentence names the problem (AI coding loses *why* context) before naming the solution; this matches GSD's problem-first opening pattern
- Value proposition in the second sentence, not the fourth — visitor should understand what taproot is before reading any code tree or feature list
- Design principles as three short philosophy bullets (inspired by OpenSpec's declarative values) — positioned before Quick Start so the visitor understands the approach, not just the tool
- Agent tier table in Quick Start — `taproot init --agent` is where tier matters; the table is inline rather than a separate section to reduce friction
- "Taproot tracks itself" section uses the live OVERVIEW.md counts as a trust signal — demonstrates production use on its own codebase; counts are static (not auto-generated) but accurate at time of writing and covered by `document-current` DoD condition
- No automated test — content is verified by human review and GitHub rendering; AC-1 through AC-5 are the acceptance criteria for any future content update; NFR-1 (no broken Markdown) is verified by GitHub rendering on push

## Source Files
- `README.md` — project landing page rewrite satisfying all 5 ACs and NFR-1

## Commits
<!-- taproot-managed -->

## Tests
- (no automated test — content artefact; ACs verified by human review; NFR-1 verified by GitHub rendering)

## Status
- **State:** in-progress
- **Created:** 2026-03-21
- **Last verified:** 2026-03-21

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md (a documentation file); no code design decisions; no architectural constraints apply | resolved: 2026-03-21
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — NFR-1 in usecase.md requires "all Markdown elements render correctly with no raw syntax visible" — testable boolean condition; threshold is specific and measurable | resolved: 2026-03-21
