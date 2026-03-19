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
- **Last verified:** 2026-03-19
