# Implementation: YAML Config — .taproot.yaml

## Behaviour
../usecase.md

## Design Decisions
- Config is optional — all values have sensible defaults (`taproot/` root, `taproot(...)` commit pattern, conventional trailer)
- Config loading walks up the directory tree from `cwd` to find the nearest `.taproot.yaml`, matching the standard convention for project config files
- Config is immutable after load — commands receive a resolved config object rather than reading the file themselves

## Source Files
- `src/core/config.ts` — config loading, defaults, type definitions, path resolution

## Commits
- (run `taproot link-commits` to populate)

## Tests
- (no dedicated test file — config loading is exercised indirectly by every integration test)

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
