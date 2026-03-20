# Implementation: CLI Command — taproot update

## Behaviour
../usecase.md

## Design Decisions
- The same `taproot update` command serves both the lifecycle maintenance use case (version migrations, stale cleanup) and the adapter refresh use case — a single entry point keeps the developer experience simple
- Stale path detection is forward-compatible: new old-paths can be added to the `STALE_PATHS` list in a future version and will be cleaned on the next `taproot update` run
- Skills are always refreshed when a Claude adapter is detected; for other agents, skills are refreshed only if already installed — avoids installing skills that weren't opted into
- `--with-hooks` installs `.git/hooks/pre-commit` (as `taproot commithook`) if it doesn't already exist; reports `exists` if already present
- Old hook content (`validate-structure`/`validate-format`) is auto-detected and migrated to `taproot commithook` unconditionally during `removeStale()` — no flag required, treated as a stale artefact

## Source Files
- `src/commands/update.ts` — stale removal, adapter regeneration, skill refresh, overview regeneration

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/update.test.ts` — covers stale path removal, idempotency, hook migration from old content, --with-hooks install, --with-hooks exists

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-20
- condition: fix-update-skill-overwrite | note: update.ts now calls installSkills(skillsDir, true) — force=true overwrites existing .taproot/skills/ files so package updates are reflected; init still uses force=false (create-only) | resolved: 2026-03-20

## DoD Resolutions
- condition: document-current | note: no docs change needed — force-overwrite of skills on update is an internal implementation detail; README and docs/agents.md describe what taproot update does (refreshes skills), not how it detects changes | resolved: 2026-03-20T20:55:08.050Z
- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — create-only vs force-overwrite is a standard copy pattern; no new reusable pattern | resolved: 2026-03-20T20:55:10.380Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — skill force-overwrite is specific to the update command; no new architectural constraint | resolved: 2026-03-20T20:55:10.150Z

- condition: check-if-affected-by: implementation-quality/architecture-compliance | note: compliant — force parameter added to installSkills follows existing patterns: no global state, parameter passed down, no I/O in core logic | resolved: 2026-03-20T20:55:09.912Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — taproot update is a CLI command, not a skill that routes user requirements | resolved: 2026-03-20T20:55:09.683Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — taproot update is a CLI command; commit-awareness governs skill prompts, not CLI source code | resolved: 2026-03-20T20:55:09.453Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — this is a CLI command implementation, not a skill file | resolved: 2026-03-20T20:55:09.218Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — taproot update is a CLI command, not a multi-document authoring skill | resolved: 2026-03-20T20:55:08.985Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — taproot update is a non-interactive CLI command, not an agent skill with a What's next? block | resolved: 2026-03-20T20:55:08.747Z

- condition: check-if-affected: skills/guide.md | note: not affected — guide.md describes what /tr-update does for users, not the internal copy logic | resolved: 2026-03-20T20:55:08.517Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts is the source file changed; now calls installSkills(skillsDir, true) to force-overwrite skills on update | resolved: 2026-03-20T20:55:08.282Z

