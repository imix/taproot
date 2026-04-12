## Interface design conventions

### Error communication
- Core logic throws `new Error(message)` for unrecoverable conditions
- CLI command handlers write to `process.stderr` and set `process.exitCode = 1` — they do not throw
- Async functions return typed result objects (`DodReport`, `Violation[]`, `CoverageReport`, etc.) — no Result/Either wrapping
- Error messages are user-facing strings: complete sentences, include the offending path or value

### Versioning and breaking changes
- Semver via `package.json` — patch for fixes, minor for new commands/options, major for breaking CLI or config changes
- No runtime version prefixes in function names
- No deprecation markers in source — breaking changes are handled at the package version boundary

### Naming patterns
- CLI registration: `register<CommandName>(program: Command): void` — e.g. `registerDod`, `registerInit`
- Core logic runners: `run<CommandName>(options): Promise<ReturnType>` — e.g. `runDod`, `runOverview`
- Validators: `check<Rule>(node): Violation[]` for individual checks; `validate<Subject>(...)` for the composed entry point
- Predicates and utilities: descriptive verb-noun — `isGitRepo`, `commitExists`, `fileLastCommitDate`

### Parameter conventions
- Multi-param functions use a single options object: `{ cwd, dryRun, implPath, ... }` — never more than 2–3 positional params
- `cwd` defaults to `process.cwd()` inside functions that need it; callers may pass it explicitly for testability
- Optional fields on options objects use `?:` — no overloads, no builder pattern

### Consistency rules
- All `run*` exports are `async` and return a typed report/result object
- All `register*` exports are synchronous and return `void`
- Validators always return `Violation[]` — never throw; the caller decides how to handle violations
- Return shapes for the same class of operation are consistent (e.g. all structure validators return `Violation[]`, not mixed types)

## Agent checklist

Before implementing any public function, command, or exported type:
- [ ] Does error communication follow the convention? Core throws; CLI handlers write to stderr + exitCode; async returns typed result
- [ ] Does the function name follow the correct pattern? (`register*`, `run*`, `check*`, `validate*`)
- [ ] If the function takes more than 2 parameters, are they collapsed into an options object?
- [ ] Does `cwd` default to `process.cwd()` and accept an override for testability?
- [ ] Does the return type match the pattern for its class? (`run*` → typed report, `check*` → `Violation[]`, `register*` → `void`)
- [ ] If this is a breaking change to a CLI command or config shape, is the semver bump planned?
