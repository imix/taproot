## Module boundary conventions

### Layer map
| Layer | Path | Responsibility |
|---|---|---|
| CLI entry | `src/cli.ts` | Parse argv, wire commands, call Commander |
| Commands | `src/commands/` | One file per command; orchestrate core + validators; own user I/O |
| Core | `src/core/` | Shared utilities: filesystem, markdown parsing, git, config, reporting |
| Validators | `src/validators/` | Validation rules only; no general utilities |
| Adapters | `src/adapters/` | Thin bridges between external systems and commands/core |

### Permitted imports
- `cli.ts` → `commands/`
- `commands/` → `core/`, `validators/`
- `core/` → `validators/types` (types only); `core/truth-checker` → `validators/format-rules` (known coupling — do not widen)
- `validators/` → `core/fs-walker`, `core/language`
- `adapters/` → `commands/init` (SKILL_FILES only), `core/`

### Forbidden imports
- `core/` must not import from `commands/` or `adapters/`
- `validators/` must not import from `commands/` or `adapters/`
- `commands/` must not import from other `commands/`

### Known coupling
`core/truth-checker` ↔ `validators/format-rules` is a bidirectional dependency that predates this convention. Do not widen this coupling — new code must not introduce additional cross-direction imports between `core/` and `validators/`.

### Upward dependency handling
When a lower layer (`core/`, `validators/`) needs behaviour from a higher layer, use dependency injection: pass the function or interface as a parameter rather than importing the higher layer directly.

## Agent checklist

Before implementing any module, class, or function:
- [ ] Does this code belong in the correct layer given its responsibility?
- [ ] Do all imports respect the permitted-imports rule?
- [ ] Are there any forbidden cross-layer imports introduced?
- [ ] If adding a `core/` → `validators/` or `validators/` → `core/` import: is this widening the known coupling? If yes — use dependency injection instead.
- [ ] If a lower layer needs something from a higher layer, is dependency injection used?
