# Discussion: Portable Skill Output Patterns

**Skill:** tr-behaviour
**Date:** 2026-04-05

## Pivotal Questions

- **Why not just fix Gemini's truncation?** It's a Gemini platform bug (multiple open issues: #8156, #3166, #9031, #23081). Even if fixed, different agents render output differently — the underlying coupling between skill logic and output rendering remains.
- **Why not prompt-first (show question before content)?** Claude Code scrolls the top out of view, so the prompt becomes invisible the other way. No single ordering works across all agents.
- **Should this be a global truth instead of a behaviour?** Considered — but this requires implementation (adapter rendering instructions, pattern declarations) not just a convention to follow.

## Alternatives Considered

1. **Prompt-first ordering** — show question before long content. Rejected: Claude scrolls top away; same problem in reverse.
2. **Write-to-disk only** — always write artifact to disk, show only summary. Rejected: too aggressive for Claude where inline works well.
3. **Summary + full content below prompt** — prompt in middle, content after. Rejected: no guarantee of rendering order across agents.
4. **Hybrid (write + abbreviated preview + prompt)** — write to disk, show key metrics + first 2 ACs + prompt. Strong option but still prescribes a specific rendering. Led to the final insight: let each adapter decide.

## Decision

Decouple output declaration from rendering. Skills declare WHAT to present (pattern type, content source, summary, actions). Each agent adapter defines HOW to render. This is the only approach that solves the problem for all agents without compromising any single agent's UX.

## Open Questions

- Exact syntax for pattern declarations in skill markdown — implementation decision
- Should there be a linter/validator that checks skills for raw rendering instructions?
- How do adapters for new agents bootstrap their rendering defaults?
