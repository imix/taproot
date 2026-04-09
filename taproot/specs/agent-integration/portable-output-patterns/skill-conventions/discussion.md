# Discussion: Skill Conventions

## Session
- **Date:** 2026-04-09
- **Skill:** tr-implement

## Pivotal Questions

- **Machine-parseable syntax vs. prose convention?** Considered a YAML frontmatter block or HTML comment markers for machine-parseability. Rejected — no validator currently enforces pattern structure, and the DoD gate is agent-driven (semantic reading), not a parser. Labeled markdown blockquotes (`> **[artifact-review]**`) are readable as prose, scannable by agents, and require no tooling changes.

- **Doc location: docs/ vs. global-truths/ vs. embedded in adapter files?** Global-truths would require scope enforcement; adapter-embedded would fragment the rendering rules across 6+ files. `docs/skill-output-patterns.md` is a single reference that agents can load on demand, consistent with how `docs/configuration.md` centralises DoD condition documentation.

- **Should this add a new `naRules` entry?** Yes — every `check-if-affected-by: <skill-related>` condition in settings.yaml has a corresponding `naRules: when: no-skill-files` entry to avoid false positives on non-skill implementations. Added for consistency.

## Alternatives Considered

- **Parser + linter** — add a validator that scans skill files for raw rendering instructions. Rejected: adds tooling complexity before the convention is established. The DoD gate (agent-driven) provides enforcement; a linter is a future enhancement if the convention is widely adopted.
- **Per-adapter rendering section in each `.claude/commands/tr-*.md`** — embed rendering instructions in each launcher. Rejected: 30+ launcher files × 4 adapters = unmaintainable; a single reference doc is preferable.

## Decision

Documentation-only implementation: define the 4 patterns and their per-adapter rendering rules in `docs/skill-output-patterns.md`, wire as a DoD condition in `settings.yaml`, and reference from `docs/configuration.md`. The convention is live immediately — no migration of existing skills required (existing skills' current prose is grandfathered; the DoD gate only fires on newly staged skill files).

## Open Questions

- Should existing skills be migrated to use explicit pattern labels? Currently grandfathered — migration would be a separate sweep task.
- Gemini rendering for `confirmation` and `progress` patterns — are inline blockquotes truncated? Assumed safe (short content); revisit if Gemini truncation issues appear for these types.
