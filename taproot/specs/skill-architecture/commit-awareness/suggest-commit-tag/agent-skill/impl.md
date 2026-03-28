# Implementation: Agent Skill — suggest-commit-tag

## Behaviour
../usecase.md

## Design Decisions
- Implemented as an addition to `skills/commit.md` (the `/tr-commit` skill) rather than a standalone skill — tag suggestion is a sub-step within the implementation commit flow, not an independently-invocable behaviour
- Tag suggestion is inserted after DoD resolution (step 4) and before staging (step 5) in the Implementation commit sub-flow — this is the natural moment when all impl.md matches are known and the commit message is being composed
- Multi-intent conflict detection: if staged files span two or more distinct intent paths, the agent cannot collapse to a single tag and offers split vs. proceed-together — matching AC-4
- Developer-supplied tags are detected by checking whether the message starts with a known prefix pattern (`taproot(`, `fix:`, `feat:`, `chore:`, etc.) — if so, the suggestion is skipped entirely per AC-3
- No TypeScript changes required — this is a pure skill instruction addition; the tag derivation logic is carried out by the agent at commit time

## Source Files
- `skills/commit.md` — added tag suggestion step (step 5) to Implementation commit sub-flow
- `taproot/agent/skills/commit.md` — sync copy of skills/commit.md

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/commit-tag-suggest.test.ts` — AC-1: single impl path → correct tag; AC-2: two impls same behaviour → collapsed tag; AC-3: developer-supplied tag preserved; AC-4: multi-intent → conflict reported; AC-5: plain commit → no tag

## Status
- **State:** in-progress
- **Created:** 2026-03-28
- **Last verified:** 2026-03-28

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: not applicable — pure skill file change; no TypeScript source files, no new CLI commands, no database or external I/O; follows the existing skill architecture pattern | resolved: 2026-03-28
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — usecase.md contains no NFR-N entries; the behaviour has no performance or reliability thresholds to implement | resolved: 2026-03-28
