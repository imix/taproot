# Implementation: README Content

## Behaviour
../usecase.md

## Design Decisions
- Animation leads the README — placed above all prose to satisfy AC-6; visitor sees the workflow before reading a word
- Hand-crafted animated SVG (`docs/demo.svg`) chosen over VHS: zero external tooling dependency, GitHub-safe, no JS required — satisfies NFR-2
- Tagline "Your AI coding agent finally knows why." placed beneath the animation as the first text — conveys the emotional benefit (AC-7) before the technical explanation
- Pain point hook preserved as the opening paragraph below the tagline — names the specific problem (AI coding loses *why* context) before any code block or feature list, satisfying AC-1
- Marketing copy throughout uses first-person emotional framing ("finally knows why", "requirements that survive the conversation") rather than feature bullets alone — AC-7
- Animation script: `npx taproot init --agent claude` → `/tr-ineed "I need user auth"` → `usecase.md written` → `taproot dod` → `✓ All checks passed` — shows the end-to-end loop in under 12 seconds
- H1 kept as "Taproot" for search/SEO; tagline is separate paragraph — intent constraint requires plain Markdown, no build step
- "Taproot tracks itself" section updated with current counts — trust signal for evaluators (AC-4)
- No automated test — content artefact; ACs verified by human review and GitHub rendering

## Source Files
- `README.md` — project landing page satisfying AC-1 through AC-7 and NFR-1
- `docs/demo.svg` — animated SVG terminal demo embedded at top of README; satisfies AC-6 and NFR-2

## Commits
- (run `taproot link-commits` to populate)

## Tests
- (no automated test — content artefact; ACs verified by human review; NFR-1/NFR-2 verified by GitHub rendering)

## Status
- **State:** in-progress
- **Created:** 2026-03-21
- **Last verified:** 2026-03-24

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — implementation writes README.md and docs/demo.svg (documentation/asset files); no code design decisions; no architectural constraints apply | resolved: 2026-03-24
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: compliant — NFR-1 requires correct GitHub Markdown rendering (testable boolean); NFR-2 requires animation renders without JS (testable boolean) — both are specific and measurable | resolved: 2026-03-24
