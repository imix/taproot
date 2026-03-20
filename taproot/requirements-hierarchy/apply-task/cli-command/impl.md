# Implementation: CLI Command — taproot apply

## Behaviour
../usecase.md

## Design Decisions
- Validation (outside taproot/, path not found) runs before any agent invocation — abort-on-first-error before touching the filesystem
- Path outside taproot/ is checked before existence, so the error message accurately reflects the reason
- Agent CLI is resolved from `config.agents` list — first entry that responds to `--version` wins; falls back to `claude`
- File path is passed to the agent via `$TAPROOT_APPLY_FILE` env var in addition to the prompt, enabling reliable shell script stubs in tests without prompt parsing
- Change detection is string comparison of snapshot vs post-agent file content — identical content → `skipped`
- On agent non-zero exit: file is restored from snapshot before recording `error` and continuing
- Agent is injectable via `agentCli` option for testing

## Source Files
- `src/commands/apply.ts` — command registration and `runApply` core logic
- `src/cli.ts` — registers `apply` command

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/apply.test.ts` — covers AC-1 (modified), AC-2 (skipped), AC-3 (path validation), AC-4 (error + restore), blank lines/comments in filelist, missing input files

## Status
- **State:** in-progress
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — stateless CLI command; external I/O (file reads/writes, agent spawn) at command boundary in runApply; no global mutable state; validation runs before any filesystem mutation | resolved: 2026-03-20T15:36:07.435Z
