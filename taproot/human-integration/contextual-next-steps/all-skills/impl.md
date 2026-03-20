# Implementation: All Skills — Next-Step Guidance

## Behaviour
../usecase.md

## Design Decisions
- **Router vs leaf classification:** `ineed` and `plan` are routers for their main paths (delegate to another skill); terminal paths within those skills (near-duplicate stop, no-candidates, HITL) are treated as leaf terminations and receive inline guidance at those specific steps
- **Deterministic format:** Single `**Next:** <command>` line for skills with exactly one continuation (`implement → plan/status`, `plan HITL → refine`)
- **Open-ended format:** Lettered `**What's next?** [A]/[B]/[C]` menu for skills where multiple options are valid; capped at 3 options to avoid overwhelming choice
- **`grill-me` output:** The "Recommended next action" block from the synthesis was removed in favour of the standard lettered menu — keeps format consistent across all skills
- **`discover` step 14:** Existing "Suggested next steps" block replaced with standard `**What's next?**` format
- **`trace` bottom-up:** Guidance split — "not found" path shows `--unlinked` and `/tr-implement`; "found" path shows `/tr-refine` and `/tr-implement`
- **`analyse-change` gate:** Guidance appears after `[A] Proceed` only — not after `[N]` (returns to loop) or `[C]` (stops)
- **No new TypeScript:** Pure skill-file authoring; no CLI changes required

## Source Files
- `skills/intent.md` — creating path step 8, refining path step 6
- `skills/behaviour.md` — step 13
- `skills/implement.md` — step 13 (new)
- `skills/refine.md` — step 9 (new)
- `skills/review.md` — step 6
- `skills/review-all.md` — step 8 (new)
- `skills/status.md` — step 7
- `skills/discover.md` — step 14
- `skills/analyse-change.md` — step 9 (after [A])
- `skills/promote.md` — step 11
- `skills/grill-me.md` — step 6
- `skills/decompose.md` — step 12 (new)
- `skills/trace.md` — bottom-up step 6, top-down step 4
- `skills/guide.md` — step 4
- `skills/ineed.md` — step 5 near-duplicate path
- `skills/plan.md` — step 3 (no-candidates), step 5 (HITL)

## Commits
<!-- taproot-managed -->

## Tests
- `test/integration/contextual-next-steps.test.ts` — verifies each skill file contains `**Next:**` or `**What's next?**` in its steps section

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20
