# Implementation: CLI Command — taproot commithook

## Behaviour
../usecase.md

## Design Decisions
- `taproot commithook` is a single CLI command replacing the old `taproot validate-structure && taproot validate-format` hook — all classification logic lives in the CLI, the hook file is just `taproot commithook`
- Commit classification uses staged file paths (`git diff --cached --name-only`) to determine tiers — no commit message parsing, so it works with any commit convention
- Implementation tier detected via reverse-lookup: `buildSourceToImplMap()` walks all impl.md files on disk, parses their `## Source Files` sections, returns a `Map<source path → impl.md path>`; any staged file appearing in this map is an implementation source file — untracked files (`.gitignore`, CI configs) are invisible and pass as plain commits
- When a staged source file is tracked but its impl.md is NOT staged, the hook fails with an explicit "stage impl.md alongside your source files" message — forces traceability on every implementation commit
- "Status-only changed" check compares `git show HEAD:<impl>` vs `git show :<impl>` using the markdown section parser — robust against whitespace and ordering; fails if any section other than `status` or `dod resolutions` differs
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
- `test/integration/commithook.test.ts` — covers: plain commit (tracked/untracked source files), requirement commit valid/invalid, declaration commit specified/not-specified/missing-Flow/missing-Related, implementation commit status-only/beyond-status/missing-impl.md/new-impl, reverse-lookup map unit tests, DoR unit checks, hook installation content

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
