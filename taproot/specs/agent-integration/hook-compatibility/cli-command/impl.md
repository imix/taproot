# Implementation: CLI Command — hook compatibility fixes

## Behaviour
../usecase.md

## Design Decisions
- **Error messages reference CLI, not slash commands** — `validateTruthSession()` in `truth-checker.ts` emits messages that name `taproot truth-sign` and `.taproot/.truth-check-session` explicitly; no agent-specific slash commands. All three error paths (missing, malformed, stale) updated.
- **`taproot commit` as primary guidance** — since the commit wrapper (P10) now exists, adapter guidance directs all agents to use `taproot commit` rather than the manual 3-step sequence; fallback manual instructions included for agents that bypass it.
- **Commit guidance added to all 5 adapter builders** — Cursor, Copilot, Windsurf, Generic, and Aider each have a section explaining `taproot commit`; no adapter-specific knowledge required by the hook itself.

## Source Files
- `src/core/truth-checker.ts` — fix 3 error message strings: `/tr-commit` → CLI commands
- `src/adapters/index.ts` — add commit/truth-sign guidance to all 5 adapter builder functions

## Commits
<!-- taproot-managed -->
- `b4a6fdd` — fix hook error messages, add commit guidance to all adapters
- `d9d264d` — declare impl

## Tests
- `src/core/truth-checker.ts` — AC-1, AC-2, AC-3: verified by reading — no `/tr-commit` references remain
- `src/adapters/index.ts` — AC-4, AC-5: verified by reading — all 5 adapters contain `taproot commit` and `taproot truth-sign` guidance; AC-6: missing-session error includes CLI command and session file name

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — error message strings are pure data in truth-checker.ts (no logic change); adapter additions are string literals in builder functions. No I/O boundary changes. | resolved: 2026-03-30
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — no NFR criteria in this spec; the changes are error message strings and adapter documentation only. | resolved: 2026-03-30

## Status
- **State:** complete
- **Created:** 2026-03-30
- **Last verified:** 2026-03-30

## DoD Resolutions
- condition: check-if-affected: skills/guide.md | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/adapters/index.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T07:45:38.047Z
- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: NOT APPLICABLE — Source Files are src/core/truth-checker.ts and src/adapters/index.ts; no skills/*.md files modified. | resolved: 2026-03-30T07:47:49.073Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — fixing error message strings and adding guidance to existing adapter builders is not a generalizable pattern. docs/patterns.md unchanged. | resolved: 2026-03-30T07:47:42.690Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — the hook error message changes are a one-time fix; no new recurring concern for all implementations. Adapter commit guidance is already part of the existing generate-agent-adapter surface. | resolved: 2026-03-30T07:47:34.935Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — error message strings in truth-checker.ts are pure data constants; no I/O boundary changes. Adapter builder functions in adapters/index.ts are pure string builders called from command boundaries; the I/O layer (generateAdapters) is unchanged. No architectural constraints violated. | resolved: 2026-03-30T07:47:28.883Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — no skill files created or modified. pattern-hints applies to skills that receive natural language intent from the developer. | resolved: 2026-03-30T07:47:18.661Z

- condition: check-if-affected: examples/ | note: NOT AFFECTED — examples/ contain sample spec structures; no examples reference error message wording or adapter commit guidance strings. | resolved: 2026-03-30T07:47:14.036Z

- condition: check-if-affected: docs/ | note: YES — updated docs/cli.md: fixed 2 stale /tr-commit references in the truth-sign section to say taproot commit. Verified docs/agents.md has no stale references. All changes applied. | resolved: 2026-03-30T07:47:09.643Z

- condition: check-if-affected: src/commands/update.ts | note: NOT AFFECTED — update.ts is the adapter generator entry point that calls the builder functions in adapters/index.ts. The builder functions are updated but the update.ts call sites are unchanged. No new commands registered. | resolved: 2026-03-30T07:47:04.995Z

- condition: check-if-affected: package.json | note: NOT AFFECTED — no new CLI commands or dependencies added. truth-checker.ts and adapters/index.ts changes are string literal updates only. package.json unchanged. | resolved: 2026-03-30T07:47:00.643Z

- condition: document-current | note: Read docs/cli.md — found 2 stale /tr-commit references in the truth-sign section; updated both to reference taproot commit (the CLI wrapper). The docs now accurately describe the tool chain. No other doc sections required updates — error message wording is an internal impl detail, not documented separately. | resolved: 2026-03-30T07:46:55.845Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/adapters/index.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T07:45:38.057Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/adapters/index.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T07:45:38.057Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/adapters/index.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T07:45:38.055Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/adapters/index.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T07:45:38.054Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: not applicable — no skills/*.md files in Source Files (src/core/truth-checker.ts, src/adapters/index.ts); auto-resolved by naRules[when:no-skill-files] | resolved: 2026-03-30T07:45:38.051Z

