## Option labeling

**Correct:** `[A] Proceed  [L] Later  [X] Drop  [C] Cancel` — each letter has its reserved meaning.
**Incorrect:** `[D] Defer` in a mid-flow prompt — `[D]` is reserved for "Done / Stop" in continuation prompts only.

**Rules detail:**
- `[D]` (Done) only in continuation prompts — omit from numbered "What's next?" menus (stopping is implicit)
- `/tr-commit` always appears as a numbered "What's next?" option, never a reserved letter
- `[S]` and `[Q]` are retired — use `[L]` Later for deferral, `[X]` Drop for exclusion, `[C]` Cancel for aborting

## Fail early

**Correct:** `taproot init` checks for a git repository before asking the user any questions.
**Incorrect:** `taproot init` asks 5 configuration questions, then fails because there's no git repo.

**Rationale:** A late failure wastes the user's time and leaves the system in a partial state.

## Abbreviated hierarchy paths

**Correct:**
- `taproot/security-findings/intent.md` → `security-findings/intent`
- `taproot/specs/security-findings/scan-engine/usecase.md` → `security-findings/scan-engine/usecase`
- `taproot/security-findings/scan-engine/` → `security-findings/scan-engine/`

**Rationale:** The hierarchy root is always known from context. Repeating it in every displayed path adds noise without information.

## Review at every spec decision point

**Applies to:**
- Pre-execution prompts (before invoking a skill on an item) — if a `usecase.md` or `intent.md` exists
- Post-execution prompts (after a spec-writing skill completes) — the just-written file is browseable immediately

**Rationale:** Agents write specs quickly. Without `[R]`, the developer has no in-flow way to verify what was written before it becomes the basis for implementation.

## Plan offer after multi-finding skills

**Correct:** `/tr-audit-all` closes with `[P] Plan these — build a taproot/plan.md from these findings`.
**Incorrect:** A review skill lists 12 findings with no follow-up path — the developer must manually re-enter them into a plan.

**Rationale:** Findings without a follow-up path get lost. A plan offer turns a review session directly into an actionable queue.

## No surprises

**Correct:** If `taproot init` is about to overwrite an existing file, tell the user — don't silently replace it.
**Incorrect:** A command silently deletes and recreates a file the user had customised.
