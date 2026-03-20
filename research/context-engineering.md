# Research: Context Engineering for LLM Agents

**Topic:** Context engineering for taproot — how to structure skills to manage context well, what is always loaded vs loaded on demand, and when to invite users to clear context.

**Researched:** 2026-03-20

---

## Local sources
- None found

## Web sources
- [Context Engineering for Agents — LangChain](https://blog.langchain.com/context-engineering-for-agents/) — four strategies: write, select, compress, isolate; canonical definition of the field
- [Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) — file system as externalized memory; don't change tool definitions mid-session (invalidates KV-cache); restorable compression (keep URL/path, drop content)
- [Agent Skills / On-Demand Loading — Chromatic Labs](https://www.chromaticlabs.co/blog/context-engineering-series-agent-skills) — load only skill metadata (~50 tokens: name + description) at startup; load full SKILL.md only when request matches the description
- [Effective Context Engineering — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — every token must serve a clear purpose; minimal viable tool set; self-healing via error feedback in context
- [Writing a Good CLAUDE.md — HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — under 200 lines; universally applicable rules only; never put style guidelines in CLAUDE.md (linter's job)
- [Karpathy 2025 LLM Year in Review](https://karpathy.bearblog.dev/year-in-review-2025/) — "context engineering is the dominant paradigm"; "context rot": as context fills, recall degrades
- [Context Engineering for Coding Agents — Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) — coding-agent specific patterns; always-loaded vs on-demand trade-offs
- [Why More Tokens Makes Agents Worse — MorphLLM](https://www.morphllm.com/context-engineering) — focused 300-token context often outperforms unfocused 113k-token context

## Key conclusions

1. **Always-loaded = minimal.** Only what's needed for *every* invocation: CLAUDE.md (short, universal rules only) and a slim skills index (name + ~50-token description). Nothing else.

2. **On-demand = everything else.** OVERVIEW.md, full skill files, spec files, impl.md — loaded only by the skill that needs them, at the step that needs them.

3. **Context rot is a real failure mode.** As context window fills, model recall degrades. A focused 300-token context can outperform an unfocused 113k-token context. Taproot skills that run long sessions should detect this and offer `/compact` or a fresh start.

4. **Skill file discipline.** Descriptions must be matchable in ~50 tokens. No embedded large docs — link to them. No cross-skill repetition. File reads must be step-scoped.

5. **Tool definitions stay stable.** Changing available tools mid-session invalidates the KV-cache — avoid dynamic tool loading/unloading.

6. **File system as memory.** Persist outputs (research docs, spec drafts) to files rather than keeping them in context. Taproot already does this via `usecase.md` and `impl.md` — it's a strength to reinforce.

## Open questions

- Should taproot ship a slim `skills-index.md` (name + description only) as a dedicated always-loaded reference, separate from the full SKILL.md files?
- At what conversation length should a skill trigger the `/compact` suggestion — and should this be a skill-level concern or a CLAUDE.md instruction?

## References
- LangChain. "Context Engineering for Agents." https://blog.langchain.com/context-engineering-for-agents/ (accessed 2026-03-20)
- Manus. "Context Engineering for AI Agents: Lessons from Building Manus." https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus (accessed 2026-03-20)
- Chromatic Labs. "Context Engineering 103 - Agent Skills." https://www.chromaticlabs.co/blog/context-engineering-series-agent-skills (accessed 2026-03-20)
- Anthropic. "Effective Context Engineering for AI Agents." https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents (accessed 2026-03-20)
- HumanLayer. "Writing a Good CLAUDE.md." https://www.humanlayer.dev/blog/writing-a-good-claude-md (accessed 2026-03-20)
- Karpathy, Andrej. "2025 LLM Year in Review." https://karpathy.bearblog.dev/year-in-review-2025/ (accessed 2026-03-20)
- Fowler, Martin. "Context Engineering for Coding Agents." https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html (accessed 2026-03-20)
- MorphLLM. "Why More Tokens Makes Agents Worse." https://www.morphllm.com/context-engineering (accessed 2026-03-20)
