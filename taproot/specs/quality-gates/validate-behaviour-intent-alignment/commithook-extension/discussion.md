# Discussion: Commithook Extension + CLAUDE.md Guidance

## Session
- **Date:** 2026-03-29
- **Skill:** tr-implement

## Pivotal Questions

1. **Should the check be LLM-based (semantic) or heuristic (structural)?** The commithook must run fast and deterministically in CI. Semantic checks ("do these ACs actually serve the goal?") require LLM judgment. The split: commithook does structural verification (parent intent exists, has non-empty Goal), CLAUDE.md guidance handles semantic verification at authoring time. Same pattern as `validate-usecase-quality`.

2. **Should the check block or warn when no parent intent is found?** Block — an orphan usecase (no parent intent) is structurally broken, not just a quality hint. The spec hierarchy requires every behaviour to live under an intent.

3. **Should intent content be read from staging area or disk?** Both — staging area first, disk fallback. This correctly handles the case where intent.md and usecase.md are both being committed in the same transaction (e.g., creating a new intent with its first behaviour).

## Alternatives Considered

- **LLM-based alignment check in commithook** — rejected: too slow for a git hook, non-deterministic, adds an API dependency to the commit path
- **Separate `taproot validate-alignment` command** — rejected: the bug asked for "at commit time" detection; a separate command users forget to run doesn't address the root cause
- **Warning only (non-blocking)** for missing parent intent — rejected: orphan usecases indicate a structural problem that should be fixed before the spec enters the hierarchy

## Decision

Extend commithook.ts with `findParentIntentPath` (directory traversal) and `checkBehaviourIntentAlignment` (pure check). Wire it into the requirement tier alongside the existing spec quality checks. Add one line to CLAUDE.md directing agents to verify goal alignment at authoring time before the hook fires.

## Open Questions

- None — the semantic check is handled by CLAUDE.md guidance and confirmed by AC-6 in the spec.
