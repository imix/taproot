# Patterns

Reusable patterns for extending and enforcing the taproot hierarchy. Each pattern solves a recurring problem — use them as building blocks rather than reinventing them.

---

## Cross-cutting constraint enforcement (`check-if-affected-by`)

**Problem:** You have an architectural rule that should apply to every implementation — not just a one-time concern, but a standing requirement. Examples: every skill must include a session hygiene signal; every skill that produces output must present a **What's next?** block; every implementation must satisfy a security review checklist. Writing this rule in a README or CLAUDE.md makes it aspirational. You want it enforced automatically, at commit time, for every new implementation.

**Pattern:** Define the rule as a behaviour spec (`usecase.md`), then add a `check-if-affected-by` entry to `.taproot/settings.yaml`.

```yaml
# .taproot/settings.yaml
definitionOfDone:
  - check-if-affected-by: skill-architecture/context-engineering
```

When the DoD runner encounters this condition, it instructs the agent to:
1. Read `taproot/skill-architecture/context-engineering/usecase.md`
2. Determine whether the current implementation is affected
3. If yes — verify compliance and apply corrections; if no — record "not applicable" with a reason

**When to use it:**
- The rule is architectural (applies across many implementations, not one)
- Compliance is agent-verifiable (the rule can be checked by reading the spec and the impl)
- The rule governs *how something is built*, not *what is built*

**Taproot's built-in uses:**

| Condition | Spec | What it enforces |
|---|---|---|
| `check-if-affected-by: human-integration/contextual-next-steps` | `taproot/human-integration/contextual-next-steps/usecase.md` | Every skill that produces output ends with a **What's next?** block |
| `check-if-affected-by: human-integration/pause-and-confirm` | `taproot/human-integration/pause-and-confirm/usecase.md` | Skills that write multiple documents pause for developer confirmation between each |
| `check-if-affected-by: skill-architecture/context-engineering` | `taproot/skill-architecture/context-engineering/usecase.md` | Skill files meet context-efficiency constraints (description ≤50 tokens, on-demand loading, `/compact` signal) |

**How to add a new cross-cutting constraint:**

1. Write the spec — `/tr-behaviour taproot/<your-intent>/ "<rule>"` — define what compliance looks like, what non-compliance looks like, and how to resolve it
2. Add to `.taproot/settings.yaml`:
   ```yaml
   definitionOfDone:
     - check-if-affected-by: <intent-slug>/<behaviour-slug>
   ```
3. On the next implementation commit, the agent reads the spec and evaluates compliance automatically

**Note:** All existing `impl.md` files that were completed before the condition was added will show the condition as unresolved the next time their source files are committed. This is intentional — it backfills compliance on the next touch.

---

## Specific file impact tracking (`check-if-affected`)

**Problem:** Certain files need manual review whenever the codebase changes — a docs index, a CLI help text, a skill guide. You want the DoD to prompt the implementer to check them, without making the check fully automated.

**Pattern:** Add a `check-if-affected` entry pointing to the file.

```yaml
definitionOfDone:
  - check-if-affected: src/commands/update.ts
  - check-if-affected: skills/guide.md
```

The agent is asked: "Does this implementation require changes to `<file>`?" If yes, it makes the changes. If no, it records why not.

**When to use it:**
- A specific file is a known integration point that frequently needs updating
- The check is simpler than a full behaviour spec (no complex compliance criteria)
- Use `check-if-affected-by` when the rule is architectural; use `check-if-affected` when the concern is a specific file

---

## Research before speccing (`/tr-research`)

**Problem:** A requirement touches an unfamiliar domain — an algorithm, a third-party protocol, an existing library ecosystem. Writing a behaviour spec without domain knowledge produces vague, incorrect, or redundant requirements.

**Pattern:** Run `/tr-research <topic>` before `/tr-behaviour`. The research skill scans local resources, searches the web, and optionally grills a domain expert. It produces a structured synthesis (local sources, web sources, key conclusions, open questions, references) that can be saved as a citable document or fed directly into a spec.

```
/tr-research "satellite tracking algorithms"
→ scan local docs, web search, expert grilling
→ save as research/satellite-tracking-algorithms.md
→ /tr-behaviour taproot/navigation/ "satellite tracking" (with research context)
```

`/tr-ineed` triggers research automatically when it detects a knowledge-intensive domain — so you often get this for free.

**When to use it:**
- The domain is unfamiliar (new algorithm, new protocol, new library)
- Existing libraries may already solve the problem (avoid reinventing the wheel)
- The spec author is not a domain expert and an expert is available to grill

---

## Open-ended agent questions (`check:`)

**Problem:** You have a one-off question the agent should reason about at DoD (or DoR) time — something too project-specific to warrant a full behaviour spec, but important enough to enforce at every commit. Examples: "should this story be split?", "does this change affect the public API contract?", "is there a simpler approach we haven't considered?".

**Pattern:** Add a `check:` entry to `definitionOfDone` (or `definitionOfReady`) in `.taproot/settings.yaml`.

```yaml
definitionOfDone:
  - check: "does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml?"
  - check: "does this story reveal a reusable pattern worth documenting in docs/patterns.md?"
```

The agent reads the question text, reasons whether the answer is yes, no, or not applicable for the current implementation, and calls `taproot dod --resolve "check: <text>" "<what was done or why it does not apply>"`.

**When to use it:**
- The question is project-specific (not architectural enough to justify a full spec)
- The question has an action: if yes, the agent *does something* (adds to config, updates docs, flags a concern)
- Use `check-if-affected-by` when the rule applies to many implementations; use `check:` for one-off reasoning prompts

**Taproot's built-in defaults:**

| Question | Action if yes |
|---|---|
| `does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml?` | Agent adds the entry to `.taproot/settings.yaml` |
| `does this story reveal a reusable pattern worth documenting in docs/patterns.md?` | Agent adds a pattern entry to `docs/patterns.md` |
