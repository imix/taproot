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
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: coverage extension reads link files using parseLinkFile() and loadReposYaml() from core module; no direct settings reads inside core logic. Compliant. | resolved: 2026-03-31T17:03:07.417Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: no NFR criteria on this usecase — coverage display is observability-only, not a measurable performance/reliability criterion | resolved: 2026-03-31

## Status
- **State:** complete
- **Created:** 2026-03-31
- **Last verified:** 2026-03-31

## DoD Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: coverage extension reads link files using parseLinkFile() and loadReposYaml() from core module; no direct settings reads inside core logic. Compliant. | resolved: 2026-03-31T17:03:10.000Z
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T17:03:32.084Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified; only src/commands/coverage.ts | resolved: 2026-03-31T17:03:08.286Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no reusable pattern — link file scanning for coverage is specific to the cross-repo-specification feature | resolved: 2026-03-31T17:03:07.999Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no new cross-cutting concern — linked coverage is an extension of existing coverage command, not a generalizable concern for all implementations | resolved: 2026-03-31T17:03:07.702Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts) | resolved: 2026-03-31T17:03:07.113Z

- condition: check-if-affected: examples/ | note: no changes — no new example commands | resolved: 2026-03-31T17:03:06.840Z

- condition: check-if-affected: docs/ | note: docs/cli.md coverage section updated with linked behaviour note | resolved: 2026-03-31T17:03:06.526Z

- condition: check-if-affected: src/commands/update.ts | note: no changes — coverage extension does not affect the update command | resolved: 2026-03-31T17:03:06.201Z

- condition: check-if-affected: package.json | note: no changes — no new dependencies | resolved: 2026-03-31T17:03:05.864Z

- condition: document-current | note: docs/cli.md coverage section updated to describe linked behaviour counting, [linked] marker, and coverage gap behaviour for link files without a referencing impl.md | resolved: 2026-03-31T17:03:05.570Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T17:03:32.086Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T17:03:32.086Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T17:03:32.085Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T17:03:32.085Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/commands/coverage.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-31T17:03:32.085Z

