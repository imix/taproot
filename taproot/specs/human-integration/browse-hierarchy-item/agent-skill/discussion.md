# Discussion: Agent Skill

## Session
- **Date:** 2026-03-25
- **Skill:** tr-implement

## Pivotal Questions

**Should browse.md have a CLI command or be pure skill?**
The behaviour is fully conversational — path resolution, section-by-section display, and [M] modify are all agent interactions with no computational work that benefits from a standalone binary. A pure skill-file implementation is the right choice, consistent with how `record-decision-rationale`, `grill-me`, and `hierarchy-sweep` are implemented.

**Where should discussion.md context appear — once at the start, or alongside each relevant section?**
Alongside the relevant section (anchored once per session), not at the start. Showing it at the top before any sections creates a wall of text before the developer has seen the spec. Anchoring to `## Main Flow` (usecase.md), `## Design Decisions` (impl.md), and `## Goal` (intent.md) surfaces it at the moment the developer most needs the deliberation context.

## Alternatives Considered

- **CLI command (`taproot browse <path>`)** — rejected. An interactive terminal pager that waits for [C]/[M]/[S] input is significantly more complex to implement as a CLI binary than as a skill. The agent naturally handles conversational turns; a binary would need a TUI framework.
- **Show discussion.md in full at the start** — rejected. Surfacing 1–2 pages of rationale before the developer has read any of the spec is noise. Anchored insertion is more useful.
- **No pagination for long sections** — rejected per AC from spec. A `## DoD Resolutions` section with 15 resolved conditions would overflow any terminal. The ~20-line guideline (soft, not hard) handles this without over-engineering.

## Decision

Pure skill implementation with six steps covering the full spec. Added to `SKILL_FILES` so it installs/updates with the package. Discussion context anchored to the most relevant section per document type rather than shown at start. Pagination threshold left as a guideline (not a constant) to give the agent judgment over edge cases.

## Open Questions
- None.
