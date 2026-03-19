# Implementation: CLI Command — taproot commithook (DoR tier)

## Behaviour
../usecase.md

## Design Decisions
- DoR logic lives in `src/core/dor-runner.ts` as a reusable module — invoked by `taproot commithook` for declaration commits, and available as a baseline for DoD
- `resolveUsecasePath(implMdPath, cwd)` resolves the parent `usecase.md` by walking one level up from the `impl.md` directory: `taproot/X/Y/Z/impl.md` → `taproot/X/Y/usecase.md`
- Baseline checks are always enforced (not configurable): usecase-exists, state=specified, validate-format, Flow section with Mermaid, Related section
- Configured `definitionOfReady` conditions in `.taproot.yaml` use the same condition format as DoD (bare built-in names, `run:` shell commands)
- If a complete impl.md already exists under the same behaviour, a warning is emitted but the commit is not blocked — allows replacement implementations

## Source Files
- `src/core/dor-runner.ts` — DoR baseline checker; resolves parent usecase.md, validates all required sections, state, Flow, Related, configured definitionOfReady conditions
- `src/commands/commithook.ts` — classifies declaration commits (impl.md only, no source files) and dispatches to `runDorChecks`

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/commithook.test.ts` — covers: declaration commit with valid spec passes, missing usecase.md fails, state not-specified fails, missing Flow fails, missing Related fails, configured DoR conditions evaluated

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
- **Agent checks (verified):**
  - `document-current`: `docs/cli.md` and `skills/guide.md` already document `taproot commithook` and DoR — no update needed
  - `check-if-affected: src/commands/update.ts` — DoR is in `dor-runner.ts`/`commithook.ts`; `update.ts` unaffected
  - `check-if-affected: skills/guide.md` — guide already lists `taproot commithook` with DoR/DoD context — no update needed
