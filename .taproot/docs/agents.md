# Agent Setup

Taproot works with any AI assistant that can read files. Run `taproot init --agent <name>` to generate the adapter for your assistant. The adapter installs the agent-specific integration files (slash commands, rules, or instruction files) that teach the agent how to use Taproot.

## Supported Agents

| Agent | Support Tier | Command | What gets installed |
|-------|-------------|---------|---------------------|
| Claude Code | **Tier 1** — fully supported | `taproot init --agent claude` | `.claude/commands/tr-*.md` — one file per slash command |
| Gemini CLI | **Tier 2** — implemented & tested | `taproot init --agent gemini` | `.gemini/commands/tr-*.toml` — one file per command |
| Cursor | **Tier 3** — community supported | `taproot init --agent cursor` | `.cursor/rules/taproot.md` — project-wide rules |
| GitHub Copilot | **Tier 3** — community supported | `taproot init --agent copilot` | `.github/copilot-instructions.md` |
| Windsurf | **Tier 3** — community supported | `taproot init --agent windsurf` | `.windsurfrules` |
| Any agent | **Tier 3** — community supported | `taproot init --agent generic` | `AGENTS.md` — agent-agnostic instructions |
| All agents | — | `taproot init --agent all` | All of the above |

**Tier 1** agents are fully tested with all features supported and covered in CI. **Tier 2** agents have working adapters with basic end-to-end validation. **Tier 3** agents are community-supported — adapters are generated but not officially validated end-to-end. Feedback and fixes welcome.

You can install multiple adapters in the same project. If your team uses Cursor and you use Claude Code, run `taproot init --agent all`.

When Taproot is updated, run `taproot update` to refresh the adapter files to the current version. The update command also removes stale files from older layouts.

---

## Skills (Claude Code)

Claude Code skills are the richest integration. Each skill is a self-contained markdown file that defines a complete interactive workflow — inputs, steps, output format, and CLI dependencies. The agent reads the skill file when you invoke the command and follows it precisely.

After `taproot init --agent claude --with-skills`, skills are available as `/tr-*` slash commands:

| Command | Purpose |
|---------|---------|
| `/tr-guide` | Onboarding walkthrough — explains the hierarchy, lists commands, tailors the guide to whether your project already has intents |
| `/tr-ineed` | Route a natural language requirement to the right place; runs structured discovery for vague requirements before placement |
| `/tr-intent` | Create or refine a business intent document with stakeholders and success criteria |
| `/tr-behaviour` | Define a UseCase under an intent or another behaviour; walks alternate flows and error conditions proactively |
| `/tr-decompose` | Break an intent into the set of behaviours needed to fulfil it |
| `/tr-implement` | Implement a behaviour: write code, write tests, create `impl.md`, commit with conventional tag |
| `/tr-trace` | Navigate the hierarchy in any direction — file to intent (bottom-up), intent to code (top-down), or across siblings |
| `/tr-status` | Coverage dashboard: shows what's implemented, what's planned, what's stale, and what to do next |
| `/tr-review` | Stress-test a single artifact — challenges assumptions, identifies gaps, asks adversarial questions |
| `/tr-review-all` | Comprehensive review of an entire subtree — structural checks, cross-cutting analysis, per-artifact findings |
| `/tr-refine` | Update a behaviour spec based on post-implementation learnings |
| `/tr-promote` | Escalate a finding from implementation or behaviour level up to the intent |
| `/tr-analyse-change` | Impact analysis before editing an existing artifact — identifies downstream breakage and related behaviours |
| `/tr-plan` | Surface the next independently-implementable work item from the hierarchy |
| `/tr-discover` | Reverse-engineer an existing codebase into a taproot hierarchy through structured, interactive discovery |
| `/tr-grill-me` | Interview you relentlessly about a plan or design — one decision branch at a time, recommended answer first |
| `/tr-research` | Research a domain or technical subject before speccing — scans local resources, searches the web, optionally grills domain experts |
| `/tr-sweep` | Apply a uniform task to a filtered set of hierarchy files — enumerate, confirm, then call `taproot apply` per file |

### How skills work

Skills are portable markdown files installed to `.taproot/skills/`. They are not IDE plugins or extensions — any agent that can read files can follow a skill. The Claude Code adapter generates `.claude/commands/tr-*.md` files that reference the skills; invoking `/tr-intent` tells Claude to load and follow `skills/intent.md`.

This means:
- Skills work even if the Claude Code extension is updated or changed
- You can read any skill file to understand exactly what the agent will do
- You can customise a skill by editing its file in `.taproot/skills/`
- Skills stay in sync with Taproot via `taproot update`

### Updating skills

```bash
taproot update
```

This refreshes all adapter files and skill definitions to the current version. Run it after upgrading the `taproot` package.

---

## Non-Claude agents

For Cursor, Copilot, and Windsurf, the adapter installs a rules or instructions file. These give the agent context on the taproot hierarchy, the document formats, and the commit convention — enough to read and navigate the hierarchy, write conformant documents, and use the CLI commands correctly.

These adapters do not provide slash commands. Instead, refer to the relevant document or hierarchy path in your prompt:

```
Look at taproot/password-reset/request-reset/usecase.md and implement the rate limiting behaviour.
```

Or ask the agent to run CLI commands directly:

```
Run taproot validate-format and fix any violations in the hierarchy.
```

The `AGENTS.md` generic adapter works with any agent and can also be used as documentation for team members who are new to Taproot.
