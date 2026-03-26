# Implementation: Hook Extension — depends-on ordering check in DoR

## Behaviour
../usecase.md

## Design Decisions
- `depends-on` is stored as a `## Depends On` markdown section in `impl.md` — consistent with the rest of the impl.md format (no YAML front matter in taproot)
- Both scalar string and YAML list syntax are normalised to an array at parse time
- Paths are project-root-relative (e.g. `taproot/quality-gates/other/impl.md`) — file-relative paths are not supported and resolve to "not found"
- Cycle detection uses iterative DFS with a visited set and a path stack — terminates on first cycle found; reports the full cycle path in the error message
- All dependency failures collected and reported together — no short-circuit on first failure (AC-5 requirement)
- The `dependsOn` field is added to `ImplData` in `impl-reader.ts` so other tools can consume it in future
- Check is added to `runDorChecks()` in `dor-runner.ts` immediately after the baseline section checks, before configured `definitionOfReady` conditions

## Source Files
- `src/core/impl-reader.ts` — adds `dependsOn: string[]` field parsed from `## Depends On` section
- `src/core/dor-runner.ts` — adds `checkImplOrdering()` function and integrates it into `runDorChecks()`

## Commits
<!-- taproot-managed -->
- `f3442f78051fedf0c2ba6b0fdecf255098458109` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/impl-ordering-constraints.test.ts` — covers all 10 ACs: happy path, blocked dep, no field, path not found, multiple deps partial failure, transitive cycle, scalar syntax, malformed value, no state field, deferred dep

## DoR Resolutions

## Status
- **State:** complete
- **Created:** 2026-03-26
- **Last verified:** 2026-03-26

## DoD Resolutions
- condition: document-current: README.md and docs/ accurately reflect all currently implemented CLI commands, skills, and configuration options | note: depends-on is a new impl.md field, not a CLI command or config option — no README or docs/ changes needed; the format reference in skills/implement.md is the natural home for impl.md field documentation | resolved: 2026-03-26T19:05:11.895Z
- condition: document-current | note: depends-on is a new impl.md field, not a CLI command or config option — no README or docs/ changes needed | resolved: 2026-03-26T19:10:13.361Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: no skill files modified in this implementation — not applicable | resolved: 2026-03-26T19:09:32.710Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: the depends-on mechanism is specific to impl.md ordering constraints; it does not generalise to a reusable pattern that applies elsewhere — no patterns.md entry needed | resolved: 2026-03-26T19:09:32.436Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: the depends-on field is an opt-in per-impl declaration, not a cross-cutting architectural rule; no settings.yaml change needed | resolved: 2026-03-26T19:09:32.168Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: reviewed against docs/architecture.md: reads files via readFileSync (filesystem as data model ✓), no module-level state (✓), error messages include actionable correction hints (✓), no external service calls (✓) — fully compliant | resolved: 2026-03-26T19:05:40.947Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: pattern-hints applies to skills that receive natural language descriptions; this implementation modifies core hook logic, not a skill — not affected | resolved: 2026-03-26T19:05:40.676Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: no skill files modified in this implementation — not affected | resolved: 2026-03-26T19:05:40.405Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: no skill files modified in this implementation — not affected | resolved: 2026-03-26T19:05:40.144Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: the ordering check runs inside the pre-commit hook with no interactive prompts — not affected | resolved: 2026-03-26T19:05:39.877Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: this implementation extends the DoR hook (CLI output, not a skill); hook output does not require What's next blocks — not affected | resolved: 2026-03-26T19:05:39.601Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: ordering check error messages use neutral language (developer, implementation) with no agent-specific syntax — compliant | resolved: 2026-03-26T19:05:39.337Z

- condition: check-if-affected: examples/ | note: starter template examples demonstrate the basic hierarchy; depends-on is an advanced optional field for ordering constraints, not a core getting-started concept — examples/ not affected | resolved: 2026-03-26T19:05:12.975Z

- condition: check-if-affected: docs/ | note: docs/ covers CLI commands, config, and architecture; depends-on is an impl.md field not surfaced as a CLI command or config option — no docs/ changes needed | resolved: 2026-03-26T19:05:12.702Z

- condition: check-if-affected: skills/guide.md | note: guide.md covers the basic workflow and slash commands; depends-on is an advanced optional impl.md field, not a workflow step — not affected | resolved: 2026-03-26T19:05:12.439Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts copies skills and adapter files; this implementation modifies core modules (impl-reader.ts, dor-runner.ts) which are not distributed via update — not affected | resolved: 2026-03-26T19:05:12.176Z

