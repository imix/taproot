# Skill: discover-truths

## Description

Scan the taproot hierarchy for implicit facts — recurring terms, business rules, and conventions — that are not yet captured as global truths. Present candidates to the developer for promotion, backlogging, or dismissal. Invoke standalone or as a final pass within `/tr-review-all`.

## Inputs

- None required. Operates on the current `taproot/` directory.

## Autonomous mode

Before following any steps, check whether autonomous mode is active:
- `TAPROOT_AUTONOMOUS=1` is set in the environment, **or**
- `--autonomous` was passed as an argument to this skill invocation, **or**
- `.taproot/settings.yaml` contains `autonomous: true`

If any of these is true, **autonomous mode is active** — skip interactive prompts and defer all candidates to `.taproot/backlog.md` as "truth candidate: `<term>`" entries, then report the summary.

## Steps

### Phase 1 — Pre-flight

1. Verify `taproot/global-truths/` exists. If not, stop:
   > "taproot/global-truths/ does not exist. Run `taproot init` or create it manually."

2. Collect all `intent.md` and `usecase.md` files under `taproot/`, excluding `taproot/global-truths/` and any unreadable files (warn per skipped path). If the count of readable files is fewer than 3, stop:
   > "Too few specs to surface patterns reliably (found N). Run discovery again after adding more specs."

### Phase 2 — Load Existing Truths and Dismissed Entries

3. Read all files in `taproot/global-truths/` (excluding `intent.md` and subdirectory `usecase.md` files — truth files are files that are NOT named `intent.md` or `usecase.md`). Collect defined terms and rules from them.

4. Read `.taproot/backlog.md` if it exists. Extract all lines matching `reviewed — not a truth: <term>` — these are permanently dismissed candidates. Build a suppression list from them.

### Phase 3 — Identify Candidates

5. Read all collected hierarchy files and scan for three candidate categories:

   **Recurring terms** — domain-specific nouns (not generic words like "user", "system", "file") that appear in 2 or more specs but have no canonical definition in `taproot/global-truths/`.

   **Business rules** — constraints or invariants stated in acceptance criteria or main flows (phrases like "must", "must not", "always", "never", "only if", "requires") that appear across 2 or more specs.

   **Implicit conventions** — patterns using "always", "never", "must not", "we use", "we don't" that recur across specs without being formally declared.

   For each candidate, determine proposed scope using these heuristics:
   - Appears in any `intent.md` → scope: `intent`
   - Appears only in `usecase.md` files → scope: `behaviour`
   - Appears only in implementation-adjacent contexts → scope: `impl`
   - Mixed → default to `intent`

6. Filter out:
   - Candidates already defined in `taproot/global-truths/`
   - Candidates matching any entry in the suppression list from step 4

   If no candidates remain after filtering, report:
   > "No new truth candidates found — the hierarchy appears consistent with existing global truths."
   Then go to Phase 5.

### Phase 4 — Present Candidates

7. Group remaining candidates by category. If more than 10 total, present in batches of 5. After each batch, ask: "[C] Continue to next batch  [D] Done — stop here".

   For each candidate, present:
   ```
   Candidate: `<term or rule>`
   Category: <recurring term | business rule | implicit convention>
   Proposed scope: <intent | behaviour | impl>
   Heuristic: <why this scope was proposed>
   Evidence:
   - `<spec path>`: "<excerpt showing the term/rule>"
   - `<spec path>`: "<excerpt showing the term/rule>"

   [P] Promote → /tr-ineed   [S] Skip   [B] Backlog   [D] Dismiss
   ```

   **Autonomous mode:** defer all candidates to backlog as "truth candidate: `<term>`" and skip to Phase 5.

8. Handle each developer choice:

   **Promote [P]:**
   - Invoke `/tr-ineed` with the candidate term, proposed scope, and evidence pre-populated as context
   - If `/tr-ineed` routes to a location other than `define-truth`, surface the routing decision:
     > "This candidate was routed to `<location>`. [A] Accept routing  [B] Override — invoke define-truth directly"
   - If the developer abandons `/tr-ineed` mid-flow: treat the candidate as skipped for this session (no truth file created; candidate reappears on next run)
   - After `/tr-ineed` completes (or is abandoned), return to the candidate list

   **Skip [S]:**
   - No record written; candidate reappears on next discovery run

   **Backlog [B]:**
   - Append to `.taproot/backlog.md`: `- [YYYY-MM-DD] truth candidate: <term>`
   - Move to next candidate

   **Dismiss [D]:**
   - Append to `.taproot/backlog.md`: `- [YYYY-MM-DD] reviewed — not a truth: <term>`
   - This entry suppresses the candidate on all future discovery runs
   - Move to next candidate

### Phase 5 — Wrap Up

9. Report:
   > "Discovery complete — N promoted, N skipped, N backlogged, N dismissed[, N remaining]."
   > (Include "N remaining" only if the developer ended the session early.)

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-ineed <candidate>` — promote a kept candidate now
   [B] `/tr-status` — see current project health
   [C] `/tr-review-all` — run a full review (includes another truth discovery pass)

## Output

- Zero or more truth files created in `taproot/global-truths/` (via `/tr-ineed` → define-truth)
- `.taproot/backlog.md` updated with any backlogged or dismissed candidates
- Summary report: N promoted, N skipped, N backlogged, N dismissed

## CLI Dependencies

None.

## Notes

- Truth files in `taproot/global-truths/` are any files that are NOT named `intent.md` or `usecase.md`. They may have any name (e.g. `glossary.md`, `pricing-rules.md`, `entity-model.md`).
- "Recurring" means 2 or more specs — not just repeated within a single spec.
- Skip generic language-level words ("the", "a", "is", "not") and taproot structural terms ("intent", "behaviour", "usecase", "implementation") — these are not domain truths.
- Dismissed entries in `.taproot/backlog.md` are matched by the literal string "reviewed — not a truth: `<term>`" — the suppression logic is substring-match on the candidate term.
- This skill is read-only on the hierarchy — it never modifies `intent.md` or `usecase.md` files directly.
