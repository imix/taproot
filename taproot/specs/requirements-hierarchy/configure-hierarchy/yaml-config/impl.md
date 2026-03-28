# Implementation: YAML Config — taproot/settings.yaml

## Behaviour
../usecase.md

## Design Decisions
- Config is optional — all values have sensible defaults (`taproot/` root, `taproot(...)` commit pattern, conventional trailer)
- Config file moved from `taproot/settings.yaml` (project root) to `taproot/settings.yaml` — consolidates all framework files under `.taproot/`
- Config loading walks up the directory tree from `cwd` to find the nearest `taproot/settings.yaml` — walk-up still supported for monorepo use cases
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
- `test/unit/config.test.ts`

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-27

## DoD Resolutions
- condition: document-current | note: docs/configuration.md covers settings.yaml config loading. README references taproot/settings.yaml in Quick Start. No new options added by this test-only change — docs are current. | resolved: 2026-03-28T16:22:30.332Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: not applicable — no skill files modified | resolved: 2026-03-28T16:22:46.361Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: no — config loading is standard; the existing patterns.md covers relevant patterns | resolved: 2026-03-28T16:22:46.102Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: no — config loading is foundational but not a new cross-cutting enforcement concern | resolved: 2026-03-28T16:22:45.849Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — config follows established TypeScript module pattern; immutable after load, deep-merge with defaults | resolved: 2026-03-28T16:22:45.593Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: not applicable — config loader is not a skill | resolved: 2026-03-28T16:22:45.339Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — not a skill file | resolved: 2026-03-28T16:22:45.087Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — not a skill file | resolved: 2026-03-28T16:22:44.829Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — config loader has no interactive prompts | resolved: 2026-03-28T16:22:44.576Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — config loader is not a user-facing skill or command output | resolved: 2026-03-28T16:22:44.325Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — config.ts is internal CLI code, not a skill or shared agent content | resolved: 2026-03-28T16:22:44.063Z

- condition: check-if-affected: examples/ | note: examples use settings.yaml but no new behaviour to document | resolved: 2026-03-28T16:22:31.607Z

- condition: check-if-affected: docs/ | note: docs/configuration.md already covers settings.yaml — no new options added | resolved: 2026-03-28T16:22:31.348Z

- condition: check-if-affected: skills/guide.md | note: guide.md does not document config loading internals | resolved: 2026-03-28T16:22:31.094Z

- condition: check-if-affected: src/commands/update.ts | note: config.ts is read-only; update.ts does not depend on loadConfig | resolved: 2026-03-28T16:22:30.843Z

- condition: check-if-affected: package.json | note: config loader — no new CLI commands or package dependencies | resolved: 2026-03-28T16:22:30.587Z

