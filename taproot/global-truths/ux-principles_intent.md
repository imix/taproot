# UX Principles

Cross-cutting design principles that apply at every level of the hierarchy — intents, behaviours, and implementations.

## Option Labeling Convention

Two distinct prompt types exist — treat them differently:

**Letters = semantic operations** with fixed meaning across all skills:

| Letter | Meaning | Where used |
|--------|---------|------------|
| `[A]` | Accept / Proceed | Mid-flow decision prompts |
| `[C]` | Cancel — abort, no changes made | Mid-flow decision prompts |
| `[R]` | Review | Mid-flow and post-execution prompts |
| `[S]` | Skip | Mid-flow decision prompts |
| `[D]` | Done / Stop for now | Continuation prompts (e.g. `[A] Continue  [D] Stop for now`) |
| `[P]` | Plan — invoke `/tr-plan` with findings | Multi-finding closing prompts |
| `[B]` | Browse | Mid-flow, when context navigation is offered |

**Numbers = positional selections** with no fixed meaning. Use for:
- "What's next?" closing menus
- Category or item pickers
- Any list where position, not semantics, determines the choice

**Rules:**
- Never repurpose a reserved letter for a different meaning in any skill
- Max 4 options in any single prompt
- `[D]` (Done) only in continuation prompts — omit from numbered "What's next?" menus (stopping is implicit)
- `/tr-commit` always appears as a numbered "What's next?" option, never a reserved letter
- `[Q]` is retired — use `[C]` for Cancel

---

## Fail Early

When something will fail, detect and surface it as early as possible in the flow — not at the end.

- Validate preconditions before starting long operations
- If a required resource (git repo, config file, dependency) is missing, check for it at the start of the command — not after the user has answered several questions or waited for work to complete
- A late failure wastes the user's time and leaves the system in a partial state

**Example:** `taproot init` should check for a git repository before asking the user any questions — not after.

## Abbreviated Hierarchy Paths

Hierarchy paths shown in skill prompts, plan items, and output use an abbreviated form — strip the hierarchy root prefix and `.md` extension. Full filesystem paths are reserved for CLI invocations only.

**Abbreviation rule:**
- Strip the leading `taproot/` prefix (or configured hierarchy root)
- Strip an optional `specs/` component if present
- Strip the trailing `.md` extension for file paths
- Preserve trailing `/` for directory references (implement items)

**Examples:**
- `taproot/security-findings/intent.md` → `security-findings/intent`
- `taproot/specs/security-findings/scan-engine/usecase.md` → `security-findings/scan-engine/usecase`
- `taproot/security-findings/scan-engine/` → `security-findings/scan-engine/`

**When to expand:** Before passing a path to any CLI command (`taproot dod`, `taproot validate-format`, `taproot browse`, etc.), prepend the hierarchy root and restore `.md` where needed.

**Rationale:** The hierarchy root is always known from context. Repeating it in every displayed path adds noise without information.

---

## Review Option at Every Spec Decision Point

Any plan-execute prompt where a spec is present or was just written must include `[R] Review` as an option, so the developer can read the spec at any point — before committing to proceed or after seeing what was written.

**Applies to:**
- Pre-execution prompts (before invoking a skill on an item) — if a `usecase.md` or `intent.md` exists at the referenced path
- Post-execution prompts (after a spec-writing skill completes) — the just-written file is browseable immediately

**Behaviour:** `[R]` invokes `/tr-browse <path>` on the relevant spec, lets browse run to completion, then re-presents the full prompt (including `[R]`) so the developer can continue reviewing or proceed.

**Rationale:** Agents write specs quickly. Without `[R]`, the developer has no in-flow way to verify what was written before it becomes the basis for implementation.

---

## Plan Offer After Multi-Finding Skills

Any skill that surfaces multiple findings, candidates, or action items — including `/tr-review-all`, `/tr-review`, `/tr-intent`, and similar — must include a plan offer in its **What's next?** section:

> `[P] Plan these — build a taproot/plan.md from these findings`

If selected: invoke `/tr-plan` with the findings as explicit source items. The developer describes which items to include and any ordering preference.

**Rationale:** Findings without a follow-up path get lost. A plan offer turns a review session directly into an actionable queue without manual re-entry.

---

## No Surprises

The user should always know what is happening. Avoid silent failures, unexpected state changes, and late-stage errors.

- Announce destructive or irreversible actions before taking them
- Surface errors with enough context to understand what went wrong and how to fix it
- Never silently skip a step or swallow an error without telling the user
- If a command does more than one thing, tell the user what it is about to do before doing it

**Example:** If `taproot init` is about to overwrite an existing file, tell the user — don't silently replace it.
