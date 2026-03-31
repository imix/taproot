# Implementation: Bundled Templates

## Behaviour
../usecase.md

## Design Decisions
- Templates are bundled in `examples/` at the package root (same pattern as `skills/` and `docs/`), resolved via `BUNDLED_EXAMPLES_DIR` pointing two levels up from `src/commands/`.
- The `--template` flag skips the interactive prompt entirely for scripted/CI use (AC-6 alternate flow).
- The interactive prompt only appears when `taproot/` does not yet exist — avoids pestering users who re-run `taproot init` to add a new agent adapter.
- `applyTemplate()` is exported separately from `runInit()` so tests can cover template application in isolation without needing a full git repo + config flow.
- `--force` only applies to `taproot/settings.yaml` overwrite (the hierarchy copy is always unconditional since it targets `taproot/`, which by definition doesn't exist when the prompt fires).
- `@inquirer/select` added as a dependency (consistent with existing `@inquirer/checkbox` and `@inquirer/confirm` already used in init).

## Source Files
- `src/commands/init.ts` — added `BUNDLED_EXAMPLES_DIR`, `AVAILABLE_TEMPLATES`, `TemplateName`, `applyTemplate()`, `--template` and `--force` options, and the interactive template prompt in `registerInit()`
- `examples/cli-tool/` — new starter: command-interface/configuration hierarchy with CLI-appropriate DoD
- `docs/cli.md` — documents `--template` and `--force` flags; documents the interactive template prompt

## Commits
<!-- taproot-managed -->
- `830437bc57152c13bdacd7efb7f0b29c4b20e77c` — (auto-linked by taproot link-commits)
- `9be52e3a926821401cd9d821bef7bef50902e85c` — (auto-linked by taproot link-commits)
- `ddc6702babb79e7929e1ef4d1a0f9286c471ee4d` — (auto-linked by taproot link-commits)
- `3293f15ae81f85e5a01f154afddbeb61edc4cf4f` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/starter-examples.test.ts` — covers AC-1 (webapp hierarchy structure), AC-3 (cli-tool DoD), AC-6 (unknown template error), settings.yaml force/no-force behaviour

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — applyTemplate() is a stateless function; file I/O via cpSync at command boundary only; no global mutable state; error messages are actionable | resolved: 2026-03-25T11:10:00.000Z
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no performance-sensitive code paths introduced; template copy is a one-time init operation | resolved: 2026-03-25T11:10:00.000Z

## Notes
- `examples/book-authoring/` was removed after this implementation was completed. The starter was found to be too domain-specific for a general-purpose template; `examples/webapp/` covers the common case. Source Files updated to reflect current state.

## Status
- **State:** complete
- **Created:** 2026-03-25

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated to document --template and --force flags and the interactive template prompt; skills/guide.md updated to mention --template in init row and new-project context note; README.md does not reference init flags in detail — it uses a minimal quick-start example, which is appropriate | resolved: 2026-03-25T11:18:24.806Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: Not applicable. No skill files modified. | resolved: 2026-03-28T15:24:18.877Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: No new reusable taproot pattern. | resolved: 2026-03-28T15:24:18.625Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: Yes — add check-if-affected: package.json to prevent future omissions of bundled directories. Will add after this commit. | resolved: 2026-03-28T15:24:18.372Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: Compliant. Adding examples/ to package.json files array has no architectural implications. | resolved: 2026-03-28T15:24:18.122Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: Not applicable. No user-facing skills modified. | resolved: 2026-03-28T15:24:17.862Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: Not applicable. No skill files modified. | resolved: 2026-03-28T15:24:17.602Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: Not applicable. No skill files modified. | resolved: 2026-03-28T15:24:17.346Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: Not applicable. No bulk-authoring skills modified. | resolved: 2026-03-28T15:24:17.083Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: Not applicable. CLI init command, not a skill. | resolved: 2026-03-28T15:24:16.828Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: Not applicable. No skill files modified. | resolved: 2026-03-28T15:24:16.571Z

- condition: check-if-affected: examples/ | note: Not affected by logic changes. examples/ content unchanged — fix is solely in package.json files array. | resolved: 2026-03-28T15:24:16.317Z

- condition: check-if-affected: docs/ | note: Not affected. docs/cli.md already documents --template flag. No new options introduced. | resolved: 2026-03-28T15:24:16.052Z

- condition: check-if-affected: skills/guide.md | note: Not affected. No new commands or workflow steps. | resolved: 2026-03-28T15:24:15.788Z

- condition: check-if-affected: src/commands/update.ts | note: Not affected. update.ts distributes skills/adapters. The package.json files fix does not change update behavior. | resolved: 2026-03-28T15:24:15.525Z

- condition: document-current | note: Read docs/cli.md — --template and --force flags are documented. README.md does not need updating. This fix adds examples/ to package.json files array only; no new CLI commands or options. | resolved: 2026-03-28T15:24:15.259Z

- condition: check-if-affected: examples/ | note: Change is to the interactive prompt UI only (confirm→select). Template content in examples/ is unchanged — no template files need updating. | resolved: 2026-03-27T10:50:33.353Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: skills/guide.md was updated (table row + context note only); the changes are read-only documentation text, no shell execution, no credentials, no agent instructions | resolved: 2026-03-25T11:19:17.001Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — bundling static data alongside CLI commands is a standard Node.js pattern already in use (BUNDLED_SKILLS_DIR, BUNDLED_DOCS_DIR); not novel enough for patterns.md | resolved: 2026-03-25T11:19:15.778Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in taproot/settings.yaml? | note: NO — bundled template application is a one-time init concern; not cross-cutting | resolved: 2026-03-25T11:19:05.709Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: compliant — applyTemplate() is a stateless pure function following the same pattern as installSkills(); I/O at command boundary only; no global mutable state; throws with actionable error on unknown template name | resolved: 2026-03-25T11:19:04.512Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints applies to skills processing user needs; this implementation adds a CLI flag and interactive prompt to the init command | resolved: 2026-03-25T11:18:57.316Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — commit-awareness applies to skills that include git commit steps; no skill files were modified | resolved: 2026-03-25T11:18:56.068Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — context-engineering applies to skill file authoring; no skill files were created or modified in this implementation | resolved: 2026-03-25T11:18:54.834Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — pause-and-confirm applies to bulk-authoring skills that write multiple documents; taproot init applies a single template and is not a bulk-authoring skill | resolved: 2026-03-25T11:18:48.273Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — this spec applies to taproot skills; this implementation modifies a CLI init command, not a skill | resolved: 2026-03-25T11:18:47.031Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — no skill files or shared hierarchy docs modified; interactive prompt text uses generic language only | resolved: 2026-03-25T11:18:45.443Z

- condition: check-if-affected: docs/ | note: APPLIED — docs/cli.md updated with --template and --force documentation and interactive prompt description | resolved: 2026-03-25T11:18:34.744Z

- condition: check-if-affected: skills/guide.md | note: APPLIED — guide.md updated: init row now mentions --template flag; new-project context note now mentions template option alongside /tr-ineed and /tr-intent | resolved: 2026-03-25T11:18:33.563Z

- condition: check-if-affected: src/commands/update.ts | note: NOT APPLICABLE — taproot update refreshes skills and adapters; templates are a one-time init concern and are not managed by update | resolved: 2026-03-25T11:18:32.284Z

