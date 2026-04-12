## Code reuse conventions

### Shared utilities location
All shared utilities and helpers live in `src/core/`. There is no `src/utils/` or `lib/shared/` — if logic is shared across commands or validators, it belongs in `src/core/`. The `src/validators/` directory is for validation rules only, not general utilities.

### Duplication threshold
Extract to `src/core/` after the second occurrence in a different file. Single-file repetition may stay inline if small (< ~10 lines) and only used locally.

### Discovery rule
Before writing logic that touches the filesystem, markdown parsing, git operations, config loading, or path resolution — scan `src/core/` first. These domains are always covered:
- Filesystem: `fs-walker.ts`, `paths.ts`
- Markdown: `markdown-parser.ts`, `impl-reader.ts`
- Git: `git.ts`
- Config: `config.ts`, `configuration.ts`
- Reporting: `reporter.ts`

### Copy-with-modification policy
Copy-with-modification is acceptable within `test/` (test helpers and fixtures per test file). In `src/`, copy-with-modification is not acceptable — extract the shared logic to `src/core/` instead.

### Acceptable duplication zones
`test/` — test fixtures and helpers may be duplicated across test files when sharing would require more abstraction overhead than the duplication costs.

## Agent checklist

Before implementing any non-trivial logic:
- [ ] Does this logic touch the filesystem, markdown, git, config, or path resolution? If yes — check `src/core/` for an existing module before writing new code
- [ ] Does similar logic already exist in another `src/commands/` or `src/validators/` file? If yes and it exceeds ~10 lines — extract to `src/core/`
- [ ] If extracting shared logic: does it live in `src/core/`, not `src/utils/` or inline in a command?
- [ ] If copy-with-modification in `src/`: is there a reason not to extract? If none — extract instead
