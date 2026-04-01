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
- DoR baseline checks (7 conditions) always run for declaration commits; configured `definitionOfReady` conditions in `taproot/settings.yaml` run additionally
- `complete` impl.mds are exempt from co-staging: `getImplState()` reads the impl.md from disk and returns the `**State:**` value; if `complete` and NOT staged, the impl is skipped — a shared source file (e.g. `src/commands/update.ts`) can be modified without re-staging every complete impl.md that mentions it. If the impl.md IS staged alongside source, all checks (Status-only, DoD) still apply regardless of state.

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
- `3f3d4b27743e2ed661cf905ab4572795b1cdca2d` — (auto-linked by taproot link-commits)
- `300092a026ff80b46537de3d998d1f82e16ec2f9` — (auto-linked by taproot link-commits)
- `ee12b1f2a74698e43eba15fe815b15f90445effd` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — covers: plain commit (tracked/untracked source files), requirement commit valid/invalid, declaration commit specified/not-specified/missing-Flow/missing-Related, implementation commit status-only/beyond-status/missing-impl.md/new-impl, reverse-lookup map unit tests, DoR unit checks, hook installation content, AC-14 complete-impl skip (source staged alone passes), regression (in-progress impl still requires co-staging)

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-27

## DoD Resolutions
- condition: document-current | note: docs/cli.md commithook section updated: added reverse-lookup explanation and new table row for missing impl.md case | resolved: 2026-03-20T07:33:53.988Z
- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: No new cross-cutting concern. The rename-skip is specific to the DoR declaration gate — it does not introduce a new architectural rule that should gate all implementations. | resolved: 2026-04-01T20:11:12.342Z

- condition: check-if-affected: package.json | note: No new CLI commands or dependencies. commithook.ts change adds rename detection using existing spawnSync — no new packages. | resolved: 2026-04-01T20:11:12.059Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NO skill files modified — this implementation touches commithook.ts, truth-sign.ts, and test files only. | resolved: 2026-03-27T15:03:47.072Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — the isHierarchyFile exclusion is a narrow correctness fix specific to commithook.ts and truth-sign.ts. Not a pattern applicable to other implementations. | resolved: 2026-03-27T15:03:45.813Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — the exclusion sync constraint is documented in docs/architecture.md as a developer guideline, not a runtime gate. Adding a check-if-affected-by would trigger on every implementation touching fs-walker.ts, which is too broad. The architecture note is the right mechanism. | resolved: 2026-03-27T15:03:44.581Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — isHierarchyFile() is a pure predicate function with no I/O. The taproot/agent/ exclusion follows the same pattern as the existing taproot/global-truths/ exclusion. All architectural principles honoured: stateless, deterministic, no global state, actionable error messages. | resolved: 2026-03-27T15:03:43.215Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — commithook is a CLI command, not a skill that receives natural language intent. | resolved: 2026-03-27T15:03:29.941Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commithook.ts is the pre-commit hook itself; commit-awareness governs skills containing git commit steps. | resolved: 2026-03-27T15:03:28.715Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — commithook.ts is the enforcement mechanism, not a skill. | resolved: 2026-03-27T15:03:27.447Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — commithook is a CLI command, not a multi-document authoring skill. | resolved: 2026-03-27T15:03:26.176Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — commithook is a CLI command invoked by git, not a skill; produces no agent guidance output. | resolved: 2026-03-27T15:03:24.867Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — commithook.ts is CLI source code, not a skill file; agent-agnostic-language governs shared skill and spec markdown files. | resolved: 2026-03-27T15:03:23.637Z

- condition: check-if-affected: examples/ | note: not affected — examples contain no taproot/agent/ files; this fix has no impact on example project structure. | resolved: 2026-03-27T15:03:11.746Z

- condition: check-if-affected: docs/ | note: AFFECTED: docs/architecture.md updated with sync constraint. docs/cli.md not affected — no user-visible commithook behaviour changed. | resolved: 2026-03-27T15:03:10.544Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md documents user-facing skill commands. The taproot/agent/ exclusion fix is an internal correctness change with no user-visible behaviour change. | resolved: 2026-03-27T15:03:09.294Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — update.ts handles hook script migration and skill file distribution. The isHierarchyFile exclusion change is internal to commithook.ts; no migration logic needed in update.ts. | resolved: 2026-03-27T15:03:08.049Z

- condition: document-current | note: docs/architecture.md updated with new constraint: DEFAULT_EXCLUDE in fs-walker.ts and isHierarchyFile guards in commithook.ts/truth-sign.ts must be kept in sync. No CLI commands or user-visible behaviour changed — docs/cli.md does not need updating. | resolved: 2026-03-27T15:02:59.249Z

- condition: tests-passing | note: 829/829 tests pass including 3 new regression tests for taproot/agent/ exclusion from isHierarchyFile | resolved: 2026-03-27T15:02:52.508Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — getImplState() is a narrow helper specific to this hook; not a reusable pattern. | resolved: 2026-03-24T15:31:21.048Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — the complete-impl skip is specific to the commithook implementation tier; no new architectural constraint affecting other implementations. | resolved: 2026-03-24T15:31:20.812Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — getImplState() is a pure read function in commithook.ts. The skip logic is a conditional in the implementation tier loop. No new I/O patterns introduced; follows existing architecture. | resolved: 2026-03-24T15:31:20.568Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — commithook is a CLI command, not a skill that receives natural language intent. | resolved: 2026-03-24T15:31:20.327Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — commithook.ts is the pre-commit hook itself; commit-awareness governs skills that contain git commit steps. | resolved: 2026-03-24T15:31:20.058Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — commithook.ts is the enforcement mechanism, not a skill; context-engineering governs skill context loading. | resolved: 2026-03-24T15:31:19.826Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — commithook is a CLI command, not a multi-document authoring skill. | resolved: 2026-03-24T15:31:19.590Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — commithook is a CLI command invoked by git, not a skill; produces no agent guidance output. | resolved: 2026-03-24T15:31:19.355Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — commithook.ts is CLI source code, not a skill file. agent-agnostic-language governs shared skill and spec markdown files. | resolved: 2026-03-24T15:31:19.112Z

- condition: check-if-affected: skills/guide.md | note: not applicable — guide.md describes skill commands for users; commithook classification internals are not documented there. | resolved: 2026-03-24T15:30:30.396Z

- condition: check-if-affected: src/commands/update.ts | note: not applicable — update.ts handles hook migration (old content → taproot commithook). The complete-impl skip logic is inside commithook.ts, not update.ts. | resolved: 2026-03-24T15:30:30.152Z

- condition: document-current | note: docs/cli.md commithook section already documents the reverse-lookup and co-staging requirement. The complete-impl skip is an implementation detail of that rule; no user-facing documentation change needed — the observable behavior (shared source files don't block commits) is self-explanatory. | resolved: 2026-03-24T15:30:29.875Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: getSection() helper for markdown section extraction is internal to commithook.ts and too narrow to document as a standalone pattern | resolved: 2026-03-21T06:27:33.982Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no new cross-cutting concern — spec quality checks are part of the existing commithook requirement tier, not a new orthogonal concern | resolved: 2026-03-21T06:27:33.753Z

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

