# UX Principles

Cross-cutting design principles that apply at every level of the hierarchy — intents, behaviours, and implementations.

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

## No Surprises

The user should always know what is happening. Avoid silent failures, unexpected state changes, and late-stage errors.

- Announce destructive or irreversible actions before taking them
- Surface errors with enough context to understand what went wrong and how to fix it
- Never silently skip a step or swallow an error without telling the user
- If a command does more than one thing, tell the user what it is about to do before doing it

**Example:** If `taproot init` is about to overwrite an existing file, tell the user — don't silently replace it.
