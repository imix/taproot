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
- DoR baseline checks (7 conditions) always run for declaration commits; configured `definitionOfReady` conditions in `.taproot/settings.yaml` run additionally

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
- `00e7123aef6b6caab016a0d1237f33b4b8b428be` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — covers: plain commit (tracked/untracked source files), requirement commit valid/invalid, declaration commit specified/not-specified/missing-Flow/missing-Related, implementation commit status-only/beyond-status/missing-impl.md/new-impl, reverse-lookup map unit tests, DoR unit checks, hook installation content

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## DoD Resolutions
- condition: document-current | note: docs/cli.md commithook section updated: added reverse-lookup explanation and new table row for missing impl.md case | resolved: 2026-03-20T07:33:53.988Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: getSection() helper for markdown section extraction is internal to commithook.ts and too narrow to document as a standalone pattern | resolved: 2026-03-21T06:27:33.982Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no new cross-cutting concern — spec quality checks are part of the existing commithook requirement tier, not a new orthogonal concern | resolved: 2026-03-21T06:27:33.753Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — new checkUsecaseQuality and checkIntentQuality functions run in the requirement tier; all 6 ACs for each behaviour are covered by tests | resolved: 2026-03-21T06:27:33.522Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: compliant — spec quality failures include actionable correction hints in the same format as existing commithook error messages | resolved: 2026-03-21T06:27:33.293Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commithook.ts is the pre-commit hook itself; commit-awareness governs skills that contain git commit steps, not the hook that enforces them | resolved: 2026-03-21T06:27:33.062Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — commithook.ts is the enforcement mechanism, not a skill; context-engineering governs skill context loading which does not apply here | resolved: 2026-03-21T06:27:25.060Z

- condition: fix-dor-sections-allowed | note: commithook.ts: ALLOWED_IMPL_SECTIONS now includes dor resolutions — allows rename sweeps to update DoR resolution notes without triggering declaration-commit requirement | resolved: 2026-03-20T21:31:02.634Z

- condition: fix-dor-sections-allowed | note: ALLOWED_IMPL_SECTIONS now includes dor resolutions — allows rename sweeps and DoR resolution changes in implementation commits; declaration-only intent preserved since DoR still runs when impl.md is staged without source files | resolved: 2026-03-20T21:26:48.213Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — commithook is a CLI command, not a skill that authors documents; pause-and-confirm does not apply | resolved: 2026-03-20T07:34:01.416Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — commithook is a CLI command invoked by git, not a skill; produces no agent guidance output | resolved: 2026-03-20T07:34:01.189Z

- condition: check-if-affected: skills/guide.md | note: not applicable — guide.md references commithook at command-reference level only; classification internals not documented there | resolved: 2026-03-20T07:34:00.961Z

- condition: check-if-affected: src/commands/update.ts | note: not applicable — update.ts migrates old hook format to taproot commithook; hook migration logic unchanged by reverse-lookup change | resolved: 2026-03-20T07:34:00.728Z

