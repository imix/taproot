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
- `taproot/agent/skills/commit.md` — synced from skills/commit.md

## Commits
- `43576af` — declare implementation
- `a091b9d` — implement truth-check session hash and pre-commit enforcement

## Tests
- `test/integration/truth-checker.test.ts` — unit tests for resolveTruthScope, scopeAppliesTo, docLevelFromFilename, collectApplicableTruths, session hash round-trip; integration tests for all 6 ACs

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed architecture-compliance spec; this implementation adds a new module (truth-checker.ts) and a new CLI command (truth-sign). It follows the existing pattern: new core module + new command + registered in cli.ts. No architectural deviations. | resolved: 2026-03-26
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new NFRs introduced; the session hash check is deterministic and synchronous. Timeout behaviour is deferred to the tr-commit skill (hook times out → allow with warning is documented in the spec as a future improvement). | resolved: 2026-03-26

## Status
- **State:** needs-rework
- **Created:** 2026-03-26
- **Last verified:** 2026-03-27

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated: added truth-sign command documentation and updated commithook table to mention truth consistency check. docs/patterns.md updated with new session-hash pattern. README.md does not list individual CLI commands and does not need updating. | resolved: 2026-03-26T12:23:54.070Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified — only truth-sign.ts and test files. | resolved: 2026-03-27T15:05:20.628Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — narrow correctness fix, not a reusable pattern. | resolved: 2026-03-27T15:05:19.364Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — covered by architecture.md constraint. | resolved: 2026-03-27T15:05:18.151Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — taproot/agent/ exclusion follows existing taproot/global-truths/ exclusion pattern. Pure predicate, no I/O, no global state. | resolved: 2026-03-27T15:05:16.921Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — truth-sign is a CLI command, not a skill. | resolved: 2026-03-27T15:05:15.642Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — truth-sign.ts is invoked by the commit skill; it is not itself a skill with commit steps. | resolved: 2026-03-27T15:05:14.349Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — truth-sign.ts is the signing mechanism, not a skill. | resolved: 2026-03-27T15:05:13.091Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — truth-sign is a CLI command. | resolved: 2026-03-27T15:05:11.877Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — truth-sign is a CLI command, not a skill producing agent guidance. | resolved: 2026-03-27T15:05:09.972Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — truth-sign.ts is CLI source, not a skill file. | resolved: 2026-03-27T15:05:08.737Z

- condition: check-if-affected: examples/ | note: not affected — examples contain no taproot/agent/ files. | resolved: 2026-03-27T15:05:07.462Z

- condition: check-if-affected: docs/ | note: AFFECTED: docs/architecture.md updated (see document-current). No other docs require updating. | resolved: 2026-03-27T15:05:06.151Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md documents user-facing skills; taproot/agent/ exclusion is an internal fix. | resolved: 2026-03-27T15:05:04.907Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts handles skill distribution and hook migration; truth-sign.ts filter change is internal. | resolved: 2026-03-27T15:05:03.671Z

- condition: document-current | note: docs/architecture.md updated with exclusion-list sync constraint. truth-sign.ts taproot/agent/ exclusion is an internal correctness fix — no user-visible behaviour change, no docs/cli.md update needed. | resolved: 2026-03-27T15:05:02.440Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: skills/commit.md modified. Step 5e instructs the agent to run taproot truth-sign — a safe read/write CLI command with no credentials. No shell execution without validation. No hardcoded tokens. Instructions are minimal and scoped to the truth-check signing operation. Compliant. | resolved: 2026-03-26T12:24:58.194Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes. Added the session-hash / agent-verified pre-commit check pattern to docs/patterns.md: agent writes a SHA-256 hash of checked content before commit; hook validates the hash. Documented with when-to-use, limitation, and built-in taproot use cases. | resolved: 2026-03-26T12:24:56.868Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no. Truth checking is enforced at requirement-commit time by the hook — it is not a DoD condition for implementations. No new settings.yaml entry is warranted. | resolved: 2026-03-26T12:24:55.610Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: implementation follows existing patterns: new core module (truth-checker.ts) + new command (truth-sign.ts) + registered in cli.ts + hook extension in commithook.ts. No deviations from established module/command patterns. | resolved: 2026-03-26T12:24:42.778Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: applies: a new pattern was added to docs/patterns.md (session-hash pattern for agent-verified pre-commit checks). The pattern-hints spec requires patterns.md to be kept current — done. | resolved: 2026-03-26T12:24:41.486Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: applies: commit.md is the commit skill itself. (C-1) Pre-commit context step (step 4 reads settings.yaml and runs the appropriate gate). (C-2) Commit classification awareness — all four types covered. (C-3) impl.md staging rule documented in implementation commit sub-flow. My new step 5 does not break any of these constraints. Compliant. | resolved: 2026-03-26T12:24:40.195Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: applies: commit.md was modified. (C-1) Description is concise (~15 tokens). (C-2) No embedded reference docs — step 5 is instructional, not documentation. (C-3) No cross-skill repetition. (C-4) Step 5 reads truth files on demand, step-scoped. commit.md is 124 lines total — compact signal not required (typically 200+ lines). Compliant. | resolved: 2026-03-26T12:24:38.927Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: applies: step 5d waits for developer choice ([A]/[B]/[C]) before proceeding when a truth conflict is found — explicit pause for confirmation. Compliant. | resolved: 2026-03-26T12:24:24.962Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: applies: commit.md produces output. Step 5d offers [A]/[B]/[C] options when a truth conflict is found — this is a contextual choice menu. The skill already has What's next? in step 6. The new step 5 is an intermediate step with a conflict-resolution menu, not the final output step. Compliant. | resolved: 2026-03-26T12:24:23.666Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: applies: commit.md was modified. Step 5 uses plain English with no agent-specific language (no Claude/Cursor-specific commands). Uses generic markdown formatting consistent with all other skill steps. Compliant. | resolved: 2026-03-26T12:24:22.366Z

- condition: check-if-affected: examples/ | note: example templates (webapp, book-authoring, cli-tool) are starter scaffolding; they contain no truth files. Global truths are user content, not template content. Examples do not need updating. | resolved: 2026-03-26T12:24:08.701Z

- condition: check-if-affected: docs/ | note: docs/cli.md and docs/patterns.md updated (see document-current resolution). docs/concepts.md, docs/configuration.md, and docs/workflows.md do not reference the commithook in detail and do not need updating for this change. | resolved: 2026-03-26T12:24:07.447Z

- condition: check-if-affected: skills/guide.md | note: guide.md is the onboarding guide for new users. taproot truth-sign is an internal command called by tr-commit — not a user-facing command. Not included in the guide. | resolved: 2026-03-26T12:24:06.186Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts handles skill file migration and hook script upgrades. truth-sign is a new CLI command, not a skill file. update.ts does not enumerate CLI commands and does not need updating. | resolved: 2026-03-26T12:24:04.913Z

