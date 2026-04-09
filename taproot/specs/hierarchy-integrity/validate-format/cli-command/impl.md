# Implementation: CLI Command — taproot validate-format

## Behaviour
../usecase.md

## Design Decisions
- Format rules operate on parsed `MarkdownDoc` objects (section map + heading) rather than raw strings — decouples rule logic from markdown parsing concerns
- Rules check for required sections, heading format, and mandatory field presence within sections
- Shares the same reporter and exit code logic as `validate-structure` for consistent CI integration

## Source Files
- `src/commands/validate-format.ts` — CLI registration, walks hierarchy and applies format rules to each marker file
- `src/validators/format-rules.ts` — individual format rule implementations (required sections, field presence, etc.)
- `src/core/markdown-parser.ts` — parses markdown into sections keyed by heading name
- `src/core/reporter.ts` — shared violation rendering and exit code logic

## Commits
- (run `taproot link-commits` to populate)

## Tests
- `test/integration/validate-format.test.ts` — end-to-end tests for valid and invalid document formats
- `test/unit/format-rules.test.ts` — unit tests for individual format rule functions
- `test/unit/markdown-parser.test.ts` — unit tests for the markdown section parser

## Status
- **State:** complete
- **Created:** 2026-03-19
- **Last verified:** 2026-04-09
