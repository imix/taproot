# Implementation: CLI Command — taproot init

## Behaviour
../usecase.md

## Design Decisions
- Interactive checkbox prompt (via `@inquirer/checkbox`) lets developers pick agent adapters at init time — avoids a required argument for the most common case
- `--agent all` shorthand installs all supported adapters in one shot
- `.taproot.yaml` is generated with commented defaults rather than a minimal file — aids discoverability for first-time users
- Skills are installed to `taproot/skills/` at init time so agents can load them locally without internet access

## Source Files
- `src/commands/init.ts` — CLI command registration, directory scaffolding, config generation, skill installation, adapter generation
- `src/templates/index.ts` — template strings for `intent.md`, `usecase.md`, and `impl.md`
- `src/adapters/index.ts` — adapter generation logic invoked by init

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/init.test.ts` — scaffolding, config generation, skill installation, hook installation, adapter generation

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
