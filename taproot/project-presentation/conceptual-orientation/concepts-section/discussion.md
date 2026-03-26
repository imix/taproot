# Discussion: Concepts Section

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

**Where does the Concepts section sit in the README?**
The spec says "after the value proposition and before Quick Start." The welcoming-readme behaviour already established the README structure. The current README has the value proposition as an unheaded prose block immediately before `## Quick Start` — so the Concepts section inserts cleanly between them without disrupting any existing heading hierarchy.

**How do we satisfy AC-2 (Concepts doesn't block Quick Start) if it sits before Quick Start?**
A developer who skips the section would have to scroll past it to reach Quick Start. The solution: a skip link (`[Quick Start ↓](#quick-start)`) as the first line of the section, rendered as a blockquote to stand out visually. This makes the section explicitly opt-in — experienced users skip in one click, new users see the signal and decide to read.

**Per-concept inline links or a single Further Reading block for AC-3?**
The AC allows either. Inline links (e.g., `[intent](docs/concepts.md)` inline in each definition) would clutter the scannable definitions. A `<details><summary>Further reading</summary>` block at the end keeps each definition clean and satisfies the AC's "clearly labelled block that individually maps each concept to its docs page" option. The `<details>` element renders natively on GitHub without JavaScript.

## Alternatives Considered
- **Inline link per concept** — rejected because it interrupts the reading flow of each definition; the definitions are already concise and adding a link parenthetical makes them harder to scan
- **Separate docs page linked from README** — rejected because the spec explicitly requires the Concepts section to be in the README itself, not a linked-out page
- **Collapsible section for the entire Concepts block** — rejected because it would hide the concepts from first-time developers who most need them; the skip link approach is better because it defaults to visible

## Decision
Insert a `## Concepts` section in `README.md` before `## Quick Start`, with a skip link as the first element, five plain-prose definitions each followed by a one-line example, and a `<details>` Further reading block mapping each concept to its existing docs page. This satisfies all five ACs with minimum prose overhead and no new files.

## Open Questions
- None
