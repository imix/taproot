# Implementation: YAML Config — .taproot/settings.yaml

## Behaviour
../usecase.md

## Design Decisions
- Config is optional — all values have sensible defaults (`taproot/` root, `taproot(...)` commit pattern, conventional trailer)
- Config file moved from `.taproot.yaml` (project root) to `.taproot/settings.yaml` — consolidates all framework files under `.taproot/`
- Config loading walks up the directory tree from `cwd` to find the nearest `.taproot/settings.yaml` — walk-up still supported for monorepo use cases
- `findConfigFile` returns both the config file path and the project root (parent of `.taproot/`), so `configDir` is always the project root, not the `.taproot/` subdirectory
- Config is immutable after load — commands receive a resolved config object rather than reading the file themselves

## Source Files
- `src/core/config.ts` — config loading, defaults, type definitions, path resolution
- `src/commands/init.ts` — creates `.taproot/` directory and writes `settings.yaml` on init

## Commits
- (run `taproot link-commits` to populate)
- `93dc43995ed503777d1564a3bf065ae53733d2c6` — (auto-linked by taproot link-commits)
- `ad376b0d9e5e3d24d38d8225d1571f0c592455d7` — (auto-linked by taproot link-commits)

## Tests
- (no dedicated test file — config loading is exercised indirectly by every integration test)

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-20
