# Implementation: CLI Command — taproot dod

## Behaviour
../usecase.md

## Design Decisions
- `DodConditionEntry` is a union type (`string | { run, name?, correction? } | { 'document-current': string } | { 'check-if-affected': string }`) — bare strings are built-in aliases, objects with `run:` are shell commands, keyed objects are agent-driven conditions
- Built-in names map to predefined shell commands and corrections in a static map in `dod-runner.ts`; no special-casing in the runner loop
- **DoD baseline** always runs when `implPath` is provided — checks parent `usecase.md` exists, `state: specified`, and `validate-format` passes. Baseline results are prepended to `DodReport.results`. This means DoD can never be a no-op when run on a specific impl.
- `agentCheck: true` on a `ResolvedCondition` causes the runner to emit "Agent check required: `<description>`" — the condition fails unless a resolution is recorded in `impl.md`
- **`taproot dod --resolve <condition> --note "<text>"`** writes a resolution entry to `## DoD Resolutions` in impl.md. On subsequent runs, `readResolutions()` reads that section; matching agent checks pass.
- **Multiple `--resolve`/`--note` pairs per invocation**: `--resolve` and `--note` are array-accumulating options (Commander collect pattern). Pairs are matched by index; a missing `--note` for a given `--resolve` defaults to `''`. Single-pair invocations are unaffected.
- Resolutions are stored in `impl.md` itself, so they travel with the implementation record. Clearing the `## DoD Resolutions` section re-triggers the checks.
- **Stale resolution detection**: `readResolutions()` compares each resolution's embedded timestamp against `mtime(impl.md)`. If `mtime > latest_timestamp + 2s`, the resolution set is stale — impl.md was modified after the agent resolved the checks, so they must be re-verified. The 2s buffer accounts for the delta between `Date.now()` and the `writeFileSync` mtime.
- `check-if-affected: <target>` is an agent-driven condition: agent reads the git diff and reasons whether `<target>` should have been updated; if so, applies changes and records resolution
- All conditions always run (no short-circuit on failure) to satisfy the "run all, report all" requirement
- `markImplComplete` uses a regex replace on the Status section — consistent with how `link-commits` appends to `impl.md`
- Exit code 127 (shell "command not found") is detected explicitly and returns the "ensure executable" correction rather than the generic fallback
- State update logic lives in `runDod` (not just the CLI action) so tests can verify it without spawning a subprocess
- YAML key must be `definitionOfDone` (camelCase) to match the TypeScript field name
- **Step-0 dirty check** (`getOutOfScopeChanges`): runs `git status --porcelain --untracked-files=all` and compares against impl's Source Files list; any modified/untracked file not in Source Files is out-of-scope; skipped when `--ignore-dirty` is set or impl has no Source Files section; `--stash` auto-runs `git stash` before proceeding; exits early with options message when out-of-scope files detected

## Source Files
- `src/core/dod-runner.ts` — parses conditions, runs baseline, runs each condition as a shell command or agent check, reads resolutions from impl.md; exports `readImplSourceFiles` for dirty-check use
- `src/commands/dod.ts` — `taproot dod [impl-path]` CLI; `--dry-run`, `--resolve`/`--note`, `--stash`, `--ignore-dirty` options; `getOutOfScopeChanges` exported; step-0 dirty check; calls runDodChecks; `writeResolution` exported for tests
- `src/validators/types.ts` — `DodConditionEntry` type and `definitionOfDone?` / `definitionOfReady?` fields on `TaprootConfig`
- `src/commands/init.ts` — `SKILL_FILES` list: `plan-build.md` replaced by `next.md` (rename)
- `src/cli.ts` — registered `registerDod`

## Commits
- (run `taproot link-commits` to populate)
- `2dbb442e0e9cabde63e667083cf9a6e329405f86` — (auto-linked by taproot link-commits)
- `de140bc4724c29bf9b651c460bcf727a69d09274` — (auto-linked by taproot link-commits)
- `4e461961391ce791134e3a49a4ee5f0bff510d59` — (auto-linked by taproot link-commits)
- `d1b969fdcb9dcfc74f60bc07f04c756bdf2fdbac` — (auto-linked by taproot link-commits)
- `abac6000c07622460d5e4362503fd5309b0d7662` — (auto-linked by taproot link-commits)
- `d881b6bcc5f94774ed3ae7be2c511f0bdd0e6cc9` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/dod.test.ts` — covers: no DoD configured, custom shell pass/fail, all-conditions-run, command not found, standalone mode (no impl.md change), impl.md marked complete on pass, not marked on fail, dry-run, document-current agent check, check-if-affected agent check, DoD baseline (usecase missing/state-wrong/format-invalid/all-pass), writeResolution, agent check passing after resolution, stale resolution detection (impl.md mtime > latest resolution timestamp), no-conditions-but-implPath marks complete
- `test/integration/dod-dirty.test.ts` — AC-19: getOutOfScopeChanges: clean tree, matching source files, untracked out-of-scope, modified out-of-scope, impl.md excluded, no Source Files section, non-git repo

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md documents taproot dod including --dry-run and --resolve; guide.md lists taproot dod | resolved: 2026-03-19T18:34:52.172Z
- condition: check-if-affected: package.json | note: not affected — writeResolution is an internal function change; no new CLI commands, options, or dependencies added | resolved: 2026-03-30T19:46:26.248Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skills/*.md modified; TypeScript CLI changes only | resolved: 2026-03-28T09:50:42.442Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — step-0 dirty check is specific to taproot dod CLI; not a generalizable pattern for other impls | resolved: 2026-03-28T09:50:42.441Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — dirty-check gate is a UX improvement to taproot dod; does not introduce a new architectural rule for all implementations | resolved: 2026-03-28T09:50:42.439Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — getOutOfScopeChanges runs git in CLI layer (commands/), not core; readImplSourceFiles call from commands/ follows architecture; no new external dependencies | resolved: 2026-03-28T09:50:25.317Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — TypeScript CLI invoked at commit time; pattern-hints applies to user-facing skills | resolved: 2026-03-28T09:50:25.316Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/core/dod-runner.ts, src/commands/dod.ts, src/validators/types.ts, src/commands/init.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T19:45:53.979Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/core/dod-runner.ts, src/commands/dod.ts, src/validators/types.ts, src/commands/init.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T19:45:53.978Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/core/dod-runner.ts, src/commands/dod.ts, src/validators/types.ts, src/commands/init.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T19:45:53.977Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/core/dod-runner.ts, src/commands/dod.ts, src/validators/types.ts, src/commands/init.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T19:45:53.977Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/core/dod-runner.ts, src/commands/dod.ts, src/validators/types.ts, src/commands/init.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T19:45:53.976Z

- condition: check-if-affected: examples/ | note: not affected — no examples use taproot dod with dirty check | resolved: 2026-03-28T09:50:25.305Z

- condition: check-if-affected: docs/ | note: affected — docs/cli.md updated with --stash and --ignore-dirty options and explanation of step-0 dirty check | resolved: 2026-03-28T09:50:25.305Z

- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/core/dod-runner.ts, src/commands/dod.ts, src/validators/types.ts, src/commands/init.ts, src/cli.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T19:45:53.974Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts regenerates skill/adapter files; no dependency on taproot dod | resolved: 2026-03-28T09:50:25.304Z

- condition: document-current | note: docs/cli.md updated: taproot dod section now documents --stash and --ignore-dirty options with explanation of the uncommitted changes pre-check (AC-19) | resolved: 2026-03-28T09:50:25.302Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — this story modifies src/commands/dod.ts (TypeScript CLI), not any skill file; no skills/*.md were changed | resolved: 2026-03-24T20:05:55.672Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — Commander array accumulator for repeatable options is a standard Commander.js pattern, not a taproot-specific reusable pattern | resolved: 2026-03-24T20:05:55.671Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — batch-resolve is a UX improvement to an existing CLI option; it does not introduce a new architectural rule that applies across implementations | resolved: 2026-03-24T20:05:55.671Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — change is an enhancement to CLI option parsing (Commander array accumulator); no architectural decisions in docs/architecture.md apply to option-parsing internals | resolved: 2026-03-24T20:05:55.671Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that route user requests (ineed, behaviour, implement, refine); taproot dod is invoked by the agent at commit time, not in response to a user expressing a need | resolved: 2026-03-24T20:05:55.670Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — this is a CLI command, not a skill; no commit steps were modified | resolved: 2026-03-24T20:05:55.670Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this is a CLI command (TypeScript source), not a skill file; context-engineering constraints apply only to skills/*.md | resolved: 2026-03-24T20:05:55.669Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — this is a CLI command (TypeScript); pause-and-confirm governs bulk-authoring skills that write multiple documents in sequence | resolved: 2026-03-24T20:05:55.669Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — this is a CLI command invoked by the agent at commit time, not a skill that produces output; contextual-next-steps applies to skills with What's next? blocks | resolved: 2026-03-24T20:05:55.669Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — this is a CLI command (TypeScript source), not an agent skill file; agent-agnostic-language constraints apply to skills/*.md | resolved: 2026-03-24T20:05:55.668Z

- condition: check-if-affected: docs/ | note: affected and updated — docs/cli.md taproot dod section now documents --resolve/--note as repeatable options with batch usage example | resolved: 2026-03-24T20:05:55.668Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md lists taproot dod at line 77; no new command added, only a new option to existing command | resolved: 2026-03-24T20:05:55.668Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — batch-resolve is a change to the dod CLI only; update.ts does not invoke or depend on taproot dod | resolved: 2026-03-24T20:05:55.667Z

- condition: document-current | note: docs/cli.md updated: taproot dod section now documents --resolve/--note batch usage and multiple-pairs-per-invocation | resolved: 2026-03-24T20:05:55.666Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: yes — added 'Open-ended agent questions (check:)' pattern to docs/patterns.md describing when and how to use check: vs check-if-affected-by | resolved: 2026-03-20T10:57:46.667Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — adding the check: condition type is a capability enhancement to the existing DoD runner; it does not define a new architectural rule that applies to every implementation | resolved: 2026-03-20T10:57:45.455Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills that route user requests; the DoD CLI command is invoked by the agent at commit time, not in response to a user expressing a need | resolved: 2026-03-20T10:57:44.173Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this implementation is a CLI command (TypeScript source), not a skill file; context-engineering constraints apply only to skill files in skills/*.md | resolved: 2026-03-20T10:57:27.071Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: This implementation is a CLI command and TypeScript parser — not a bulk-authoring skill. The pause-and-confirm behaviour applies only to skills that write multiple documents in sequence (discover, decompose). Not applicable. | resolved: 2026-03-20T07:15:41.144Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: This implementation is a CLI command (taproot dod) and a TypeScript parser — it is not a skill file. The contextual-next-steps behaviour applies to agent skill files that produce output. Not applicable. | resolved: 2026-03-20T07:15:39.917Z

- condition: check-if-affected: skills/guide.md | note: guide.md already lists taproot dod command | resolved: 2026-03-19T18:34:54.681Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts does not invoke dod; no change needed | resolved: 2026-03-19T18:34:53.462Z

