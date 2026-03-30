# Discussion: CLI Command

## Session
- **Date:** 2026-03-30
- **Skill:** tr-implement

## Pivotal Questions

**1. Should NA rules be config-driven or hardcoded?**
Initial plan had a hardcoded table in the implementation. User flagged this as wrong: taproot is a dogfooded project and should have no magic — any hardcoded logic in taproot itself creates a privileged class of projects. Shifted to `naRules` in `settings.yaml`, with `taproot init` shipping the defaults. Now taproot's own settings.yaml uses the same mechanism as any other project.

**2. What triggers "agent check required" in the dry-run?**
Rather than re-parsing condition entries from config to detect agent-check conditions, we detect them by the `output` prefix "Agent check required:" in the DodResult. This avoids coupling to condition internals and reuses the existing detection path.

**3. How to handle unknown `when` values?**
Could error and halt, or warn and skip. Spec says warn and skip (AC-10). This matches taproot's "fail early but don't destroy work" principle — a misconfigured rule shouldn't block the user from running the command.

## Alternatives Considered
- **Hardcoded NA rules table** — rejected: created a privileged taproot implementation; violated dogfooding principle
- **`naRules` as a separate top-level command** — rejected: the behaviour is an extension of `taproot dod`, not a separate concept; a new command would confuse the mental model
- **Detecting agent-checks by re-parsing config entries** — rejected: more fragile than checking the output string; conditions can change shape

## Decision
Config-driven `naRules` in `settings.yaml` with a closed `when` predicate vocabulary (`prose-only`, `no-skill-files`). The command reads rules from config, evaluates predicates against `## Source Files`, and calls `writeResolution()` for each match. Protected conditions are hardcoded safety invariants in the command. `taproot init` ships sensible defaults so new projects get value immediately without configuration.

## Open Questions
- None
