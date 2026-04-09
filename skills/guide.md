# Skill: guide

## Description

Present a tailored onboarding guide for the Taproot workflow. Explains what Taproot is, the three-layer hierarchy, available slash commands, CLI tools, and where to start. Read-only — no files are created or modified.

## Inputs

None required. The skill reads current project state to tailor the guide.

## Steps

1. Check whether `taproot/` exists in the project root. If it does, check whether any intent directories exist (subdirectories containing an `intent.md` file). Note whether `taproot/OVERVIEW.md` exists.

2. Present the following guide, tailored to current state:

---

**Taproot** is a requirements traceability system that links business intent to code through a three-layer hierarchy.

### The Three-Layer Hierarchy

```
taproot/
└── <intent>/          # Why — business goal, stakeholders, success criteria
    └── <behaviour>/   # What — use cases, acceptance criteria
        └── <impl>/    # How — code, tests, traceability records
```

Every folder is identified by its marker file: `intent.md`, `usecase.md`, or `impl.md`.

### Typical Workflow

```
ineed → intent → behaviour → implement → trace → status
```

1. **ineed** — route a requirement to the right place; runs structured discovery for vague ideas
2. **intent** — define a business goal with stakeholders and success criteria
3. **behaviour** — specify use cases under an intent (or decompose an intent first)
4. **implement** — write code, tests, and an `impl.md` traceability record
5. **trace** — link recent commits back to existing taproot documents
6. **status** — health dashboard: coverage, orphans, stale specs

### Slash Commands (AI-driven content creation)

| Command | Purpose |
|---|---|
| `/tr-ineed` | Route a requirement; runs structured discovery for vague ideas |
| `/tr-bug` | Diagnose a defect through 5-Why root cause analysis and delegate to the right fix skill |
| `/tr-intent` | Create or refine a business intent document |
| `/tr-behaviour` | Define use cases under an intent or another behaviour |
| `/tr-implement` | Implement a behaviour with code, tests, and `impl.md` |
| `/tr-trace` | Navigate the hierarchy in any direction — file to intent (bottom-up), intent to code (top-down), lateral across siblings |
| `/tr-status` | Generate a health dashboard for the hierarchy |
| `/tr-audit` | Stress-test a spec with adversarial questions |
| `/tr-audit-all` | Audit an entire subtree — structural checks, cross-cutting analysis, per-artifact findings |
| `/tr-discover-truths` | Scan the hierarchy for implicit facts and promote them to global truths |
| `/tr-define-truth` | Capture any truth — free-form or structured (architecture decisions, principles, conventions, external constraints) |
| `/tr-browse` | Read a hierarchy document section by section in the terminal — with inline editing via `[M] Modify` |
| `/tr-backlog` | Capture an idea or finding instantly mid-session; called with no args opens triage to discard, keep, or promote items |
| `/tr-explore` | Collaborative exploration of a vague idea before speccing — one question at a time, hands off to the right skill when ready |
| `/tr-grill-me` | Interview the user relentlessly to sharpen a plan or design |
| `/tr-research` | Research a domain or technical subject before speccing — local resources, web search, expert grilling |
| `/tr-next` | Surface the next independently-implementable work item from the hierarchy |
| `/tr-plan` | Build a persistent implementation plan (`taproot/plan.md`) from backlog items, hierarchy gaps, or explicit items |
| `/tr-plan-execute` | Execute items from `taproot/plan.md` — step-by-step, batch, specify (spec+refine only), or implement (implement only) mode |
| `/tr-plan-analyse` | Analyse `taproot/plan.md` before execution — check readiness, flag ambiguous specs, unresolved dependencies, and missing prerequisites |
| `/tr-sweep` | Apply a uniform task to a filtered set of hierarchy files — enumerate, confirm, then call `taproot apply` |
| `/tr-link` | Create a cross-repo link file (`link.md`) referencing a spec in another repository |
| `/tr-commit` | Execute the full commit procedure: classify type, run proactive gates, resolve DoD/DoR conditions, stage, and commit |
| `/tr-refine` | Update a behaviour spec based on implementation learnings |
| `/tr-promote` | Move discoveries from implementation back upstream |
| `/tr-guide` | Show this guide |

### CLI Commands (validation and reporting)

| Command | Purpose |
|---|---|
| `taproot validate-structure` | Check folder and file naming conventions |
| `taproot validate-format` | Check document frontmatter, required fields, and cross-link sections |
| `taproot check-orphans` | Find folders missing their marker files |
| `taproot coverage` | Show implementation coverage across the hierarchy |
| `taproot sync-check` | Detect specs that may be stale relative to code |
| `taproot overview` | Regenerate `taproot/OVERVIEW.md` summary |
| `taproot dod [impl-path]` | Run Definition of Done checks; mark impl complete if all pass |
| `taproot commithook` | Pre-commit gate: classifies staged files and runs DoR or DoD as appropriate |
| `taproot update` | Refresh agent adapters, skills, and cross-link sections across the hierarchy |
| `taproot init [--template webapp\|book-authoring\|cli-tool]` | Initialize Taproot in a project; optionally copy a starter hierarchy |

### Rule of Thumb

> **Slash commands for content, CLI for validation.**
>
> Use `/tr-*` commands when you want the AI to create or update documents.
> Use `taproot` CLI commands to validate, report, and check structural integrity.

---

3. After presenting the guide, add a context-aware note:

   - **If `taproot/OVERVIEW.md` exists**: "Your project has an overview at `taproot/OVERVIEW.md` — read it for a summary of current intents and their status."
   - **If intents exist but no OVERVIEW.md**: "Your project has existing intents. Run `taproot overview` to generate a summary, or use `/tr-status` for a full health report."
   - **If no intents exist yet** (empty or missing `taproot/`): "This looks like a new project. You can start from a template (`taproot init --template webapp|book-authoring|cli-tool`) for a pre-populated hierarchy, or describe your problem to `/tr-ineed`, or jump straight to `/tr-intent` if you already know what you want to build."

4. Close with context-aware guidance:

   Nothing obvious next — whenever you're ready:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [1] `/tr-ineed` — capture your first (or next) requirement
   [2] `/tr-status` — see the current project health at a glance
   [3] `/tr-backlog` — triage captured ideas (only if `taproot/backlog.md` is non-empty)

## Output

A formatted guide presented in the conversation. No files are created or modified.

## CLI Dependencies

None.

## Natural Language Triggers

Invoke the matching skill whenever the developer uses these phrases — even without a slash command:

| Phrase(s) | Invoke |
|---|---|
| "commit", "let's commit", "commit that", "commit this" | `/tr-commit` |
| "create a plan", "make a plan", "plan this", "plan this out", "build a plan" | `/tr-plan` |
| "what's next", "what should I work on", "next item" | `/tr-next` |
| "add to backlog", "capture this", "log this idea" | `/tr-backlog` |
| "I need", "we need", "the system should", "we also need" | `/tr-ineed` |
| "it's broken", "wrong output", "this crashes", "not working", "regression" | `/tr-bug` |
| "research", "look into", "investigate", "find out about", "explore" | `/tr-research` |

These triggers apply regardless of which agent is running. Do not use a built-in tool (e.g. the agent's native Plan tool) when a taproot skill covers the intent.

## Skill authoring references

When writing or modifying a skill file (`skills/*.md`):
- **Output interactions** — use named output patterns instead of raw rendering instructions. See `docs/skill-output-patterns.md` for the 4 pattern types (`artifact-review`, `confirmation`, `progress`, `next-steps`) and per-adapter rendering rules.
- **Option labeling** — letters carry fixed semantic meaning (`[A]` = Accept, `[C]` = Cancel, `[D]` = Done, etc.). Numbers are positional. See `global-truths/ux-principles_intent.md`.
- **Agent-agnostic language** — use "the agent" not "Claude". Adapter-specific instructions belong in `.claude/commands/`, not in `skills/*.md`.

## Notes

- This skill is read-only. It reports, it does not modify.
- The guide is intentionally self-contained — it can be understood without prior Taproot knowledge.
