# Implementation: CLI Command

## Behaviour
../usecase.md

## Design Decisions
- **`taproot commit` delegates truth-sign internally**: The command reuses `runTruthSign()` from `truth-sign.ts` — no duplication of signing logic. If truth-sign exits non-zero the commit is aborted before `git commit` runs.
- **Only stages `.taproot/.truth-check-session` automatically**: No other implicit staging. All other file selection is explicit (`--all` or prior `git add`).
- **`stdio: 'inherit'` for `git commit`**: The pre-commit hook output (taproot commithook) must reach the developer's terminal verbatim. Using `stdio: 'inherit'` ensures hook output is not swallowed.
- **Hierarchy detection is identical to `truth-sign.ts`**: Uses the same path-prefix filter (`taproot/`, excluding `global-truths/` and `agent/`) so the truth-sign decision is consistent.
- **No implicit DoD**: `taproot commit` does not run DoD. DoD is enforced by the pre-commit hook, not by this command. The command's job is workflow orchestration, not quality checking.

## Source Files
- `src/commands/commit.ts` — new `taproot commit` command
- `src/cli.ts` — added `registerCommit` import and call

## Commits
- (run `taproot link-commits` to populate)
- `de81275ed56aa45c58192490b76cc9ecad67f415` — (auto-linked by taproot link-commits)
- `d2ed5a01a1f572e837959fb062f7f714a0410447` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commit-workflow.test.ts` — covers AC-2 through AC-5, AC-7: truth-sign skipped for source-only, truth-sign skipped without global-truths, --all stages all, nothing-staged error, dry-run makes no changes

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed docs/architecture.md; this implementation adds a new thin CLI command (src/commands/commit.ts) registered in cli.ts. No new modules, no new commands beyond the single taproot commit wrapper. Delegates to existing truth-sign.ts. Agent-agnostic output preserved. Compliant. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — commit-workflow/usecase.md contains no NFR-N entries in ## Acceptance Criteria. No performance, reliability, or accessibility thresholds. | resolved: 2026-03-29

## Status
- **State:** complete
- **Created:** 2026-03-29
- **Last verified:** 2026-03-29

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/commands/commit.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T05:56:40.349Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: APPLIES — skills/commit.md modified. Added text references taproot commit CLI command only. No shell execution, no credentials, no elevated permissions. Least-privilege preserved. Compliant. | resolved: 2026-03-30T05:57:27.923Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — taproot commit is a CLI command, not a reusable pattern for implementation authoring. | resolved: 2026-03-30T05:57:27.923Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — taproot commit is a workflow convenience command. No new cross-cutting concern. | resolved: 2026-03-30T05:57:27.922Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — reviewed docs/architecture.md. New src/commands/commit.ts is a thin orchestration wrapper registered in cli.ts. No new modules, no module boundary crossings. Delegates to existing truth-sign.ts. Agent-agnostic output. Compliant. | resolved: 2026-03-30T05:57:27.922Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — this implementation does not add a new pattern to docs/patterns.md. taproot commit is a CLI workflow command, not a reusable behaviour pattern. | resolved: 2026-03-30T05:57:27.921Z

- condition: check-if-affected: examples/ | note: No new user-visible workflow introduced. taproot commit replaces manual steps — existing examples are unaffected. examples/ unchanged. | resolved: 2026-03-30T05:57:27.920Z

- condition: check-if-affected: src/commands/update.ts | note: No new skill files or agent adapters registered. skills/commit.md was already tracked; no new SKILL_FILES entries needed. update.ts unchanged. | resolved: 2026-03-30T05:57:27.920Z

- condition: check-if-affected: package.json | note: No new npm dependencies. taproot commit is a pure TypeScript addition reusing existing spawnSync and truth-sign. package.json unchanged. | resolved: 2026-03-30T05:57:27.919Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — docs/cli.md: added taproot commit section. Synced to taproot/agent/docs/cli.md. | resolved: 2026-03-30T05:57:27.919Z

- condition: document-current | note: docs/cli.md: added 'Commit Workflow' section with taproot commit synopsis, --all, --dry-run, truth-sign trigger logic, and pre-commit hook behaviour. Synced to taproot/agent/docs/cli.md. README.md does not enumerate individual CLI commands. Docs current. | resolved: 2026-03-30T05:57:27.917Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/commands/commit.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T05:56:40.351Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/commands/commit.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T05:56:40.351Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/commands/commit.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T05:56:40.351Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/commands/commit.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T05:56:40.350Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/commands/commit.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T05:56:40.350Z

