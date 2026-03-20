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
- `4beb91b319e05bcd29558d4d9b79b79d755a3960` — (auto-linked by taproot link-commits)
- `d83f105bc08903b77860325b0f92068472944c96` — (auto-linked by taproot link-commits)
- `f9fa8b401171c71879823d7c7c585fa21db25fca` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/apply.test.ts` — covers AC-1 (modified), AC-2 (skipped), AC-3 (path validation), AC-4 (error + restore), blank lines/comments in filelist, missing input files

## Status
- **State:** complete
- **Created:** 2026-03-20
- **Last verified:** 2026-03-20

## DoR Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — stateless CLI command; external I/O (file reads/writes, agent spawn) at command boundary in runApply; no global mutable state; validation runs before any filesystem mutation | resolved: 2026-03-20T15:36:07.435Z

## DoD Resolutions
- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — stateless CLI command; external I/O (file reads/writes, agent spawn) in src/commands/apply.ts at command boundary; core logic (validation, diff) inline in command handler (no separate core module needed at this size); no global mutable state; error messages are actionable | resolved: 2026-03-20T15:36:07.435Z
- condition: document-current | note: added taproot apply to docs/cli.md under new Bulk Operations section — documents filelist format, status codes, agent resolution, and connection to /tr-sweep | resolved: 2026-03-20T15:39:21.500Z
- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts propagates skill and adapter files to agent directories; taproot apply is a CLI command, not an adapter or skill; no changes needed | resolved: 2026-03-20T15:39:32.083Z
- condition: check-if-affected: skills/guide.md | note: not affected — guide.md covers the taproot workflow conceptually for onboarding; taproot apply is a CLI utility called by skills, not a skill developers invoke directly; no mention needed in onboarding guide | resolved: 2026-03-20T15:39:32.312Z
- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot apply is a CLI command, not a taproot skill; contextual-next-steps applies to skills that produce primary output; this command produces a summary printout to stdout, not a skill interaction | resolved: 2026-03-20T15:39:41.613Z
- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — pause-and-confirm applies to skills that write multiple documents in sequence requiring human confirmation; taproot apply is a CLI command that processes a pre-approved filelist autonomously; no interactive document authoring | resolved: 2026-03-20T15:39:41.843Z
- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — context-engineering applies to skill files (skills/*.md); taproot apply is a CLI command (src/commands/apply.ts), not a skill | resolved: 2026-03-20T15:39:42.074Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to agent skills that process user-expressed needs via the taproot skill system; taproot apply is a non-interactive CLI command | resolved: 2026-03-20T15:39:42.303Z
- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to agent skills that process user-expressed needs via the taproot skill system; taproot apply is a non-interactive CLI command | resolved: 2026-03-20T15:39:42.303Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot.yaml? | note: no new cross-cutting concern — taproot apply is a point command; the filelist+prompt pattern used by /tr-sweep is documented in usecase.md and the Related section, but does not rise to a cross-cutting constraint requiring enforcement across all implementations | resolved: 2026-03-20T15:39:53.088Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no new pattern to document — the agent invocation via CLI with filesystem access is the same pattern used by existing commands; the env-var injection for test isolation ($TAPROOT_APPLY_FILE) is a testing detail, not a broadly reusable pattern | resolved: 2026-03-20T15:39:53.312Z
