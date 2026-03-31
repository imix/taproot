# Implementation: coverage extension

## Behaviour
../usecase.md

## Design Decisions
- Link files are scanned at each node's immediate directory only (non-recursive into child behaviour/impl folders) — avoids double-counting when a link file exists alongside a usecase.md and its impl subfolder.
- `readdirSync` on the immediate folder to find `link.md` / `*-link.md` — simpler than calling `findLinkFiles()` which walks the full tree; coverage only cares about the folder where a linked item lives.
- Impl coverage check: for each impl child node of a behaviour, resolve every Source Files entry relative to the impl folder and compare against the link file's absolute path. A match means the impl claims this linked behaviour.
- `reposMap` loaded once in `runCoverage()` and passed through for unresolvable-link warnings (AC-4). Coverage counting is purely based on local impl.md state — no link resolution needed for counts.
- Intent-type links (`Type: intent`) are counted in `totals.linkedIntents` and displayed at intent level in the report; they do not affect behaviour/impl counts (AC-5).
- `behaviour` and `truth` type links affect behaviour counts: gap = +1 behaviour (unimplemented); pending = +1 impl (not complete); complete = +1 impl + +1 completeImpl.
- Unresolvable link detection: `warnUnresolvable = true` when `reposMap` is null (repos.yaml absent) OR the repo URL has no entry in the map. Displayed with `⚠` in the report but does not change counts.

## Source Files
- `src/commands/coverage.ts` — extended with LinkedItemSummary, linked item scanning, and updated formatters

## Commits
- (placeholder)

## Tests
- `test/integration/linked-coverage.test.ts` — AC-1 through AC-5: linked behaviour coverage counting and display

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: coverage extension reads link files using parseLinkFile() and loadReposYaml() from core module; receives rootPath via command options, not direct settings reads inside core logic. Compliant. | resolved: 2026-03-31
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no NFR criteria on this usecase — coverage display is observability-only, not a measurable performance/reliability criterion | resolved: 2026-03-31

## Status
- **State:** in-progress
- **Created:** 2026-03-31
- **Last verified:** 2026-03-31
