# Intent: Domain Research Before Speccing

## Stakeholders
- Developer: authoring a behaviour spec — needs requirements grounded in real-world solutions and domain knowledge, not assumptions
- AI agent: operating inside `/tr-ineed` or `/tr-implement` — needs domain context to produce accurate, well-informed specs
- Tech lead / architect: reviewing specs — wants evidence that existing solutions and literature were considered before custom work was commissioned

## Goal
Enable developers and agents to research any domain or technical subject before writing a behaviour spec — by scanning local resources, searching the web, and drawing on expert knowledge — so that requirements are grounded in what already exists and what domain practice recommends, rather than invented from scratch.

## Success Criteria
- [ ] A developer can invoke `/tr-research <topic>` and receive a structured synthesis of local resources (PDFs, datasheets, reference implementations), web findings (libraries, papers, repos), and expert knowledge
- [ ] The research output can be saved as a citable document (`research/<topic>.md`) or fed directly into a spec — the developer chooses at runtime
- [ ] `/tr-ineed` can auto-trigger research when a knowledge-intensive topic is detected, feeding the synthesis forward without requiring an explicit invocation
- [ ] Expert grilling is seeded with what was actually found — library APIs, paper abstracts, known constraints — not generic questions
- [ ] Any saved research document includes cited references (URLs, file paths, paper titles)

## Constraints
- Web search must be available in the agent's tool context; skill degrades gracefully when offline (local + expert paths still run)
- Research does not replace speccing — it feeds into it; the skill always terminates in a spec or a saved document, never in a dead end

## Behaviours <!-- taproot-managed -->
- [Research a Subject](./research-subject/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-20
- **Last reviewed:** 2026-03-20
