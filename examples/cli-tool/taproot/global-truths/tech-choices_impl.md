# Technical Conventions

Implementation-level conventions. All `impl.md` files must respect these choices.

## Exit codes

- `0` — success
- `1` — user error (bad input, missing argument)
- `2` — system error (file not found, permission denied)

All commands must exit with one of the above codes. Never exit with an undocumented code.

## Output format

- Errors go to `stderr`, never `stdout`
- Structured output (tables, JSON) goes to `stdout`
- Human-readable status messages go to `stdout` unless `--quiet` is set
