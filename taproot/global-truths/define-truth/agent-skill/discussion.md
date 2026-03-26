# Discussion: Agent Skill

## Session
- **Date:** 2026-03-26
- **Skill:** tr-implement

## Pivotal Questions

1. **Should define-truth be a CLI command or a skill?**
   Creating a markdown file in `taproot/global-truths/` is a file-write — trivially done by the agent. A CLI command would only add scaffolding (boilerplate file creation), not semantic help. The value is in the scope determination conversation and the scope ambiguity warning, both of which are agent-native. Skill wins clearly.

2. **Should the skill infer scope from context, or ask?**
   Inferring scope from the truth content (e.g. "this mentions an impl detail so it's impl-scoped") would be fragile and could silently misscope an important truth. Explicit confirmation is low-friction (one question) and prevents hard-to-detect errors. Ask explicitly.

3. **How does this integrate with `/tr-discover-truths`?**
   The discover-truths flow routes promoted candidates to `/tr-ineed` which then routes to define-truth. The natural integration is an optional `candidate` argument that pre-populates term, scope hint, and evidence. This makes the transition seamless without coupling the two skills tightly.

## Alternatives Considered

- **CLI command `taproot define-truth`** — rejected because the value is in the conversation (scope + content), not file scaffolding.
- **Fully automated inference of scope from content** — rejected because scope errors are silent and consequential; a single confirmation step is the right trade-off.
- **Separate skills for suffix vs. sub-folder convention** — rejected; the choice is trivial and the developer should pick based on project convention, not separate entry points.

## Decision

Implemented as a skill file. The skill is interactive (scope determination, convention choice), accepts a pre-populated context from discover-truths/ineed, and writes the truth file directly. Scope ambiguity is surfaced as a post-write warning rather than a blocker.

## Open Questions
- None.
