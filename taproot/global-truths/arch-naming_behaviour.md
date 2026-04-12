## Naming conventions

### Files
`kebab-case` for all source files, regardless of what they export:
- `dod-runner.ts`, `fs-walker.ts`, `validate-format.ts`, `check-orphans.ts`

### Functions
`camelCase` verbs. Command entry points follow `run<CommandName>`:
- `loadConfig`, `parseImplData`, `walkHierarchy`
- `runDod`, `runNew`, `runDodChecks`

### Interfaces and types
`PascalCase`. No `I` prefix:
- `DodResult`, `DodReport`, `GitCommit`, `ImplData`, `TruthScope`

### Constants
`SCREAMING_SNAKE_CASE`:
- `DEFAULT_CONFIG`, `MODULE_SKILL_FILES`, `AVAILABLE_TEMPLATES`

### Boolean-returning functions
Prefix with `is` or use a verb that is inherently boolean (`exists`, `matches`):
- `isGitRepo`, `commitExists`, `globMatches`

### Test factory helpers
Prefix with `make`:
- `makeTempDir`, `makeImplMd`, `makeUsecaseMd`

## Agent checklist

Before naming any new symbol:
- [ ] File name: `kebab-case`?
- [ ] Function name: `camelCase` verb? If it's a command entry point, `run<CommandName>`?
- [ ] Interface or type: `PascalCase`, no `I` prefix?
- [ ] Constant: `SCREAMING_SNAKE_CASE`?
- [ ] Boolean-returning function: starts with `is` or uses an inherently boolean verb?
- [ ] Test factory: starts with `make`?
