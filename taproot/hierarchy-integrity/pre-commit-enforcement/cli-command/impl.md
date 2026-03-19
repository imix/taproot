# Implementation: CLI Command — taproot commithook

## Behaviour
../usecase.md

## Design Decisions
- `taproot commithook` is a single CLI command replacing the old `taproot validate-structure && taproot validate-format` hook — all classification logic lives in the CLI, the hook file is just `taproot commithook`
- Commit classification uses staged file paths (`git diff --cached --name-only`) to determine tiers — no commit message parsing, so it works with any commit convention
- "Source file" is defined as any staged file NOT under `taproot/` or `.taproot/` — covers src/, test/, dist/, config files, root .md files
- "Status-only changed" check compares `git show HEAD:<impl>` vs `git show :<impl>` using the markdown section parser — robust against whitespace and ordering; fails if any section other than `status` differs
- If impl.md is new in HEAD (first commit), it's treated as not-yet-declared and the implementation commit is rejected — forces the two-commit discipline (declaration then implementation)
- DoD is run in `--dry-run` mode from the hook — the hook does not mark impl complete, only gates the commit
- DoR baseline checks (7 conditions) always run for declaration commits; configured `definitionOfReady` conditions in `.taproot.yaml` run additionally

## Source Files
- `src/commands/commithook.ts` — `taproot commithook` CLI command; staged file classification, tier dispatch, status-only check
- `src/core/dor-runner.ts` — DoR baseline checker; resolves parent usecase.md, validates all required sections, state, Flow, Related
- `src/commands/init.ts` — updated hook installation: writes `taproot commithook` instead of raw validate commands
- `src/validators/types.ts` — added `definitionOfReady?: DodConditionEntry[]` to `TaprootConfig`
- `src/cli.ts` — registered `registerCommithook`

## Commits
- (to be filled by taproot link-commits)
- `0a615b4f54387c9863b13c657dc474b97acdd644` — (auto-linked by taproot link-commits)
- `668555b15c48975f5d576c57f88bea40f0609756` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — covers: plain commit passes, requirement commit valid/invalid, declaration commit specified/not-specified/missing-Flow/missing-Related, implementation commit status-only/beyond-status/new-impl, DoR unit checks, hook installation content

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
