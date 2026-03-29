# Implementation: Commithook Extension + CLAUDE.md Guidance

## Behaviour
../usecase.md

## Design Decisions
- `checkBehaviourIntentAlignment` is a pure function (like `checkUsecaseQuality`) — takes usecase path, resolved intent path, intent content, and pack; returns `SpecFailure[]`. This keeps it unit-testable without git.
- `findParentIntentPath` does filesystem traversal from the usecase.md's directory upward, checking for `intent.md` at each ancestor level within the `taproot/` subtree. Returns the first found path or `null`.
- Intent content is read from the git staging area first (`getStagedContent`) so that in-flight intent changes are respected; falls back to reading from disk. This handles the case where intent.md and usecase.md are committed together.
- When no parent intent is found, the check blocks with a clear message — orphan usecases are a structural problem that should be fixed before committing.
- Agent-side semantic check implemented as CLAUDE.md guidance ("read parent intent Goal and verify ACs address it") — avoids LLM overhead in the commithook and follows the same pattern as `validate-usecase-quality`.
- Check runs inside the existing requirement-tier block alongside `checkUsecaseQuality` — no new tier needed.

## Source Files
- `src/commands/commithook.ts` — `findParentIntentPath`, `checkBehaviourIntentAlignment`, wired into requirement tier
- `CLAUDE.md` — agent guidance: read parent intent Goal before writing usecase ACs

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/commithook.test.ts` — `checkBehaviourIntentAlignment` unit describe block (AC-1 to AC-5) + integration test for staged usecase with valid parent intent

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — this impl IS a quality gate check; it extends commithook.ts in the same pattern as existing checks (`checkUsecaseQuality`, `checkIntentQuality`). No architectural decisions made. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. This behaviour has no performance, security, or reliability thresholds to verify. | resolved: 2026-03-29

## Status
- **State:** in-progress
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29
