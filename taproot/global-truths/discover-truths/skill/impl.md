# Implementation: Skill

## Behaviour
../usecase.md

## Design Decisions
- **Skill-only implementation**: no new CLI command or TypeScript code is required; the entire behaviour is agent-driven and implemented as a skill prose file. All scanning, filtering, and candidate presentation steps are agent-executed at invocation time.
- **Dismissed suppression via backlog.md**: candidates dismissed by the developer are appended as "reviewed — not a truth: `<term>`" entries to `.taproot/backlog.md`. On the next discovery run the skill reads this file and excludes those entries — reusing the existing backlog format rather than introducing a separate suppression list.
- **review-all integration is additive**: the truth discovery pass is added as a new final step in `review-all.md`. It reuses the same scan and candidate logic, but outputs into a `## Truth Candidates` section in the review report and defers unprocessed candidates to backlog automatically.
- **Batch limit of 5**: matches the usecase spec (batches of 5 when >10 candidates). Avoids overwhelming the developer and keeps context manageable.
- **`/tr-ineed` routing with pre-populated context**: promoted candidates are passed to `/tr-ineed` with the candidate term, proposed scope, and evidence pre-populated. If `/tr-ineed` routes to a location other than `define-truth`, the skill surfaces the routing decision and offers to redirect.

## Source Files
- `skills/discover-truths.md` — standalone skill implementing the full discover-truths usecase (Main Flow, all Alternate Flows, Error Conditions)
- `skills/review-all.md` — extended with step 7: truth discovery pass appended to the review report
- `.taproot/skills/discover-truths.md` — synced copy for agent use
- `.taproot/skills/review-all.md` — synced copy for agent use

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/discover-truths.test.ts` — covers AC-1 (candidates surfaced from recurring terms), AC-2 (filtering of already-defined truths), AC-4 (backlogged candidate recorded in backlog.md), AC-5 (skipped candidate leaves no record), AC-6 (too-small hierarchy exits cleanly), AC-8 (dismissed candidate suppressed from future runs)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed architecture-compliance spec; this implementation adds two skill files (discover-truths.md, review-all.md update) and one test file. No TypeScript source changes. No architectural deviations — follows the established skill + test pattern. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new NFRs introduced; the skill is interactive and latency is not a measurable concern. No performance constraints in the usecase. | resolved: 2026-03-26

## Status
- **State:** in-progress
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26
