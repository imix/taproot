# Implementation: CLI Command — taproot commithook (DoR tier)

## Behaviour
../usecase.md

## Design Decisions
- DoR logic lives in `src/core/dor-runner.ts` as a reusable module — invoked by `taproot commithook` for declaration commits, and available as a baseline for DoD
- `resolveUsecasePath(implMdPath, cwd)` resolves the parent `usecase.md` by walking one level up from the `impl.md` directory: `taproot/X/Y/Z/impl.md` → `taproot/X/Y/usecase.md`
- Baseline checks are always enforced (not configurable): usecase-exists, state=specified, validate-format, Flow section with Mermaid, Related section
- Configured `definitionOfReady` conditions in `taproot/settings.yaml` use the same condition format as DoD (bare built-in names, `run:` shell commands, `check:` agent questions)
- `check:` conditions are resolved by reading `## DoR Resolutions` in the staged impl.md — no staleness check (impl.md is brand-new at declaration commit time)
- `readDorResolutions(implMdPath, cwd)` reads the `## DoR Resolutions` section from impl.md on disk, returning resolved condition names as a Set
- If a complete impl.md already exists under the same behaviour, a warning is emitted but the commit is not blocked — allows replacement implementations

## Source Files
- `src/core/dor-runner.ts` — DoR baseline checker; resolves parent usecase.md, validates all required sections, state, Flow, Related, configured definitionOfReady conditions
- `src/commands/commithook.ts` — classifies declaration commits (impl.md only, no source files) and dispatches to `runDorChecks`

## Commits
- (run `taproot link-commits` to populate)
- `80f4c5639b67ba9a6d142d7b09ee3bfef0cffe17` — (auto-linked by taproot link-commits)
- `36bb198880650dd18afaeb0324a8b23b62298c19` — (auto-linked by taproot link-commits)
- `efe7505cdcde245eb66a77546b8f50c702217fbd` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — covers: declaration commit with valid spec passes, missing usecase.md fails, state not-specified fails, missing Flow fails, missing Related fails, configured DoR conditions evaluated; check: fails when unresolved, passes when DoR Resolutions present

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-21
- **Agent checks (verified):**
  - `document-current`: `docs/cli.md` and `skills/guide.md` already document `taproot commithook` and DoR — no update needed
  - `check-if-affected: src/commands/update.ts` — DoR is in `dor-runner.ts`/`commithook.ts`; `update.ts` unaffected
  - `check-if-affected: skills/guide.md` — guide already lists `taproot commithook` with DoR/DoD context — no update needed

## DoD Resolutions
- condition: document-current | note: docs/cli.md and skills/guide.md already document taproot commithook with DoR context | resolved: 2026-03-19T18:17:46.871Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NOT APPLICABLE — no skills/*.md files modified. Change is to src/core/dor-runner.ts only. | resolved: 2026-03-30T06:01:35.101Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — improving an error message is not a cross-cutting concern. No new settings.yaml entry needed. | resolved: 2026-03-30T06:01:35.100Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — dor-runner.ts is a TypeScript CLI module, not a skill file. No agent-agnostic language concerns. | resolved: 2026-03-30T06:01:35.100Z

- condition: check-if-affected: examples/ | note: No new user-visible workflow introduced. examples/ unchanged. | resolved: 2026-03-30T06:01:35.099Z

- condition: check-if-affected: docs/ | note: NOT AFFECTED — the error message improvement is an internal UX change. docs/cli.md describes the commithook command generally, not specific error message text. No doc update needed. | resolved: 2026-03-30T06:01:35.099Z

- condition: check-if-affected: package.json | note: No new npm dependencies. dor-runner.ts change is TypeScript-only: improved correction message for implemented/tested state. package.json unchanged. | resolved: 2026-03-30T06:01:35.089Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — src/commands/commithook.ts follows architecture rules: stateless, I/O at command boundary, no global state; change adds one constant to ALLOWED_IMPL_SECTIONS | resolved: 2026-03-20T21:31:40.376Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — definition-of-ready CLI command has no git commit step; it validates impl.md specs and reports DoR results | resolved: 2026-03-20T21:31:40.146Z

- condition: fix-dor-sections-allowed | note: commithook.ts: same fix — dor resolutions added to allowed sections so DoR notes can be updated in implementation commits | resolved: 2026-03-20T21:31:02.861Z

- condition: fix-dor-sections-allowed | note: same fix — dor resolutions added to ALLOWED_IMPL_SECTIONS in commithook.ts | resolved: 2026-03-20T21:26:48.449Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — check: at DoR uses the same pattern as check: at DoD, already documented in docs/patterns.md | resolved: 2026-03-20T11:09:39.794Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — adding check: to DoR is a capability enhancement, not a new cross-cutting concern | resolved: 2026-03-20T11:09:38.516Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills routing user requests; commithook is a git hook | resolved: 2026-03-20T11:09:37.297Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this is a CLI command (TypeScript source), not a skill file | resolved: 2026-03-20T11:09:36.041Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot commithook is a CLI command, not a skill that authors multiple documents | resolved: 2026-03-20T11:09:34.773Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot commithook is a CLI command invoked by git; it produces no agent guidance output | resolved: 2026-03-20T11:09:33.498Z

- condition: check-if-affected: skills/guide.md | note: guide.md lists taproot commithook with DoR/DoD context; no new command added, only internal behavior; no update needed | resolved: 2026-03-20T11:09:32.260Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — DoR changes are in dor-runner.ts; update.ts only regenerates adapter files | resolved: 2026-03-20T11:09:30.997Z

- condition: document-current | note: docs/configuration.md updated: added check: to DoD condition table and added definitionOfReady section with DoR Resolutions format | resolved: 2026-03-20T11:09:29.794Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no new pattern introduced — check: at DoR follows the same pattern as check: at DoD (already documented in docs/patterns.md); the DoR Resolutions section follows the same format as DoD Resolutions | resolved: 2026-03-20T11:04:50.444Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: no — adding check: to DoR is a capability enhancement; it does not introduce a new architectural rule requiring a new check-if-affected-by entry | resolved: 2026-03-20T11:04:49.215Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — pattern-hints applies to skills routing user requests; taproot commithook is a git hook, not a user-facing skill | resolved: 2026-03-20T11:04:47.936Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this implementation is a CLI command (TypeScript source), not a skill file | resolved: 2026-03-20T11:04:46.673Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot commithook is a CLI command, not a skill that authors multiple documents in sequence | resolved: 2026-03-20T11:04:45.392Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot commithook is a CLI command invoked by git; it produces no agent guidance output | resolved: 2026-03-20T11:04:44.160Z

- condition: check-if-affected: skills/guide.md | note: guide.md lists taproot commithook with DoR/DoD context; no new command was added, only internal behavior; no update needed | resolved: 2026-03-20T11:04:42.898Z

- condition: check-if-affected: src/commands/update.ts | note: not affected — DoR changes are in dor-runner.ts; update.ts only regenerates adapter files and does not touch DoR logic | resolved: 2026-03-20T11:04:41.643Z

- condition: document-current | note: updated docs/configuration.md: added check: to DoD condition table; added Definition of Ready section documenting definitionOfReady, check: at DoR, and DoR Resolutions format | resolved: 2026-03-20T11:04:40.371Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot commithook is a CLI command, not a skill that authors documents in sequence | resolved: 2026-03-20T07:34:57.109Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot commithook (DoR tier) is a CLI command invoked by git; it produces no agent guidance output | resolved: 2026-03-20T07:34:56.869Z

- condition: check-if-affected: src/commands/update.ts | note: DoR logic lives in dor-runner.ts/commithook.ts; update.ts unaffected | resolved: 2026-03-19T18:17:48.139Z
- condition: check-if-affected: skills/guide.md | note: guide.md already lists taproot commithook with DoR/DoD context | resolved: 2026-03-19T18:17:49.396Z
