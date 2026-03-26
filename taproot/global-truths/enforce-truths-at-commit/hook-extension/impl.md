# Implementation: Hook Extension

## Behaviour
../usecase.md

## Design Decisions
- **Session hash model over inline LLM invocation**: the pre-commit hook cannot call an LLM directly (too slow, requires auth). Instead, `tr-commit` performs the semantic check via the agent and writes a `.taproot/.truth-check-session` file containing a SHA-256 hash of the staged doc contents + applicable truth contents. The hook validates this hash at commit time. If the hash is absent or mismatched (content changed since the agent checked), the commit is blocked.
- **`taproot truth-sign` command**: a dedicated CLI command writes the session file after agent approval, keeping session management out of the skill and testable independently.
- **Scope-based truth collection**: `collectApplicableTruths(cwd, docLevel)` implements the cascade model — intent-scoped truths apply to all levels, behaviour-scoped to behaviour+impl, impl-scoped to impl only. README.md is always skipped.
- **`isGlobalTruth()` guard in commithook**: truth files ending with `intent.md` (e.g. `glossary_intent.md`) would otherwise match the spec quality checker. The guard excludes `taproot/global-truths/` files from all hierarchy quality checks.
- **No new commithook tier**: truth checks are added inside the existing requirement tier, after spec quality checks. This keeps the tiers clean — truths only apply when hierarchy docs are staged.
- **`global-truths/` excluded from fs-walker**: the directory is not a hierarchy folder, so it's added to `DEFAULT_EXCLUDE` alongside `skills/` to suppress false validation errors.

## Source Files
- `src/core/truth-checker.ts` — scope resolution, truth collection, session hash write/validate
- `src/commands/truth-sign.ts` — `taproot truth-sign` command
- `src/commands/commithook.ts` — truth session validation added to requirement tier
- `src/core/fs-walker.ts` — `global-truths` added to DEFAULT_EXCLUDE
- `src/commands/init.ts` — creates `taproot/global-truths/` with README hint on init
- `src/cli.ts` — registers `truth-sign` command
- `skills/commit.md` — step 5 added to requirement commit sub-flow (truth check + truth-sign)
- `.taproot/skills/commit.md` — synced from skills/commit.md

## Commits
- (to be filled)

## Tests
- `test/integration/truth-checker.test.ts` — unit tests for resolveTruthScope, scopeAppliesTo, docLevelFromFilename, collectApplicableTruths, session hash round-trip; integration tests for all 6 ACs

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed architecture-compliance spec; this implementation adds a new module (truth-checker.ts) and a new CLI command (truth-sign). It follows the existing pattern: new core module + new command + registered in cli.ts. No architectural deviations. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new NFRs introduced; the session hash check is deterministic and synchronous. Timeout behaviour is deferred to the tr-commit skill (hook times out → allow with warning is documented in the spec as a future improvement). | resolved: 2026-03-26

## Status
- **State:** in-progress
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26
