# Implementation: All Levels

## Behaviour
../usecase.md

## Design Decisions
- **Unified truth check block**: the truth session validation was moved out of the `requirement` tier and into a single unified block that runs after all tier-specific checks. This ensures one session hash covers all staged docs (hierarchy docs + impl.md + source file paths), matching what `truth-sign` produces.
- **Source file identity via path list**: impl-level commits hash source file paths (sorted, joined) rather than their content. This anchors the session to the staged file set without requiring re-signing on content edits after staging — consistent with the semantic nature of agent review.
- **Backward-compatible**: for pure requirement commits (only hierarchy docs staged), the unified block collects the same docs and truths as before. All 34 existing requirement-tier truth tests pass unchanged.
- **Baseline DoR unchanged**: the `baseline-usecase-exists` check already gates impl commits on usecase.md presence. Tests needed a usecase.md in the setup to satisfy this.

## Source Files
- `src/commands/commithook.ts` — unified truth check block replacing requirement-only check
- `src/commands/truth-sign.ts` — extended to include impl.md + source file paths in session hash
- `skills/commit.md` — step 4 added to implementation sub-flow (truth check before staging)
- `.taproot/skills/commit.md` — synced from skills/commit.md

## Commits
- placeholder

## Tests
- `test/integration/truth-checker.test.ts` — AC-7: impl source commit blocked without session; AC-7 pass: session covers impl level; AC-8: scope ladder — behaviour commit excludes impl truths; AC-9: session invalidated when staged source files change; AC-10: enforcement automatic (no settings.yaml entry needed)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: this change restructures commithook.ts — the truth check block moves from inside the requirement tier to a standalone unified block at the end of runCommithook. No new modules, no new CLI commands. Pattern is the same as the existing requirement-tier truth check. Compliant. | resolved: 2026-03-27
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no new NFRs. The session hash computation is the same deterministic SHA-256 as before; extending it to cover impl-level staged files does not change the performance or measurability characteristics. | resolved: 2026-03-27

## Status
- **State:** complete
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27

## DoD Resolutions
- condition: document-current | note: No new CLI commands or config options introduced. commithook.ts is internal; truth-sign.ts already documented. skills/commit.md updated with new step 4 (truth check in implementation sub-flow). docs/cli.md does not need updating — no new commands. README.md unchanged. | resolved: 2026-03-27T12:06:05.127Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: skills/commit.md modified. Step 4e instructs the agent to run taproot truth-sign — a safe read/write CLI command. No shell execution without validation, no credentials, no tokens. Compliant. | resolved: 2026-03-27T12:06:57.468Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No new pattern. The session-hash pattern in docs/patterns.md already covers this. The extension to impl-level is a scope change to an existing pattern, not a new one. | resolved: 2026-03-27T12:06:56.187Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No. Truth checking at impl commit time is enforced by the hook automatically — no settings.yaml entry is needed or warranted. This is the whole point of the story. | resolved: 2026-03-27T12:06:54.930Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Applies: commithook.ts restructured (truth check block moved). No new modules, no new commands. Follows existing module/command pattern. Compliant. | resolved: 2026-03-27T12:06:43.697Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: No new pattern added to docs/patterns.md. The session-hash pattern is already documented (hook-extension impl). Extending it to impl-level is covered by the existing pattern description. | resolved: 2026-03-27T12:06:42.401Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Applies: commit.md was modified. (C-1) Pre-commit context step reads settings.yaml. (C-2) All four commit types covered. (C-3) impl.md staging rule documented. New step 4 does not break any constraint. Compliant. | resolved: 2026-03-27T12:06:41.123Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Applies: commit.md was modified. (C-1) Description concise. (C-2) No embedded reference docs in step 4. (C-3) No cross-skill repetition. (C-4) Step 4 reads truth files on demand. commit.md is ~135 lines total — compact not required. Compliant. | resolved: 2026-03-27T12:06:39.798Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Applies: step 4d waits for developer choice before proceeding when a truth conflict is found during an implementation commit. Explicit pause. Compliant. | resolved: 2026-03-27T12:06:29.787Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Applies: commit.md produces output. Step 4d offers [A]/[B]/[C] choices when a truth conflict is found in an impl commit — contextual choice menu. Compliant. | resolved: 2026-03-27T12:06:28.524Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Applies: skills/commit.md was modified. Step 4 uses plain English with no agent-specific language. Generic markdown formatting consistent with all other skill steps. Compliant. | resolved: 2026-03-27T12:06:27.280Z

- condition: check-if-affected: examples/ | note: Example templates contain no truth files and no source files tracked by impl.md. Not affected. | resolved: 2026-03-27T12:06:18.718Z

- condition: check-if-affected: docs/ | note: Applies: docs/patterns.md already has the session-hash pattern (added in hook-extension). The extension to impl-level is a change in scope, not a new pattern. No docs update required. | resolved: 2026-03-27T12:06:17.429Z

- condition: check-if-affected: skills/guide.md | note: guide.md is the onboarding guide. The truth check at impl commit time is automatic — no new user-facing command or workflow step to document. Not applicable. | resolved: 2026-03-27T12:06:16.137Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts handles skill migration and hook script upgrades. No new CLI commands or hook scripts introduced. Does not need updating. | resolved: 2026-03-27T12:06:14.836Z

