# Implementation: document-current DoD built-in

## Behaviour
../usecase.md

## Commits
- `6ae04ec` — taproot(documentation/generate-readme/dod-builtin): add document-current DoD condition

## Tests
- `test/integration/dod.test.ts` — covers `document-current` condition parsing, manual-check reporting, and subsequent condition execution

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19

## Notes
- `document-current` is resolved as a parameterizable DoD condition rather than a standalone generate-readme behaviour
- The condition is agent/human-verified: no shell command is run; the description parameter is surfaced as correction context
- `.taproot.yaml` entry: `document-current: ensure all sections in readme.md are up to date`
- `readme-current` built-in removed from `BUILTINS` in `dod-runner.ts`
