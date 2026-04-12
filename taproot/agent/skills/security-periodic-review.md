# Skill: security-periodic-review

## Description

Two modes: **setup** — elicit the periodic security review checklist and cadence, write `security-periodic-review_behaviour.md`; **run** — execute the review against the configured checklist, surface findings, and update last-reviewed dates. Run setup once during module activation; run the review manually whenever a periodic check is due.

## Inputs

- `--run` (optional flag): Invoke run mode directly. Without this flag, setup mode runs if no truth file exists; run mode runs if a truth file is present and the developer selects it.

## Steps

### Mode detection

1. Read `taproot/global-truths/security-periodic-review_behaviour.md` if it exists.

   - If no truth file exists: run **Setup mode** (steps 2–7).
   - If truth file exists and `--run` is passed: run **Run mode** (steps 8–13).
   - If truth file exists and `--run` is not passed: ask:

   > A periodic review checklist is already configured. What would you like to do?
   >
   > **[R]** Run the review now   **[U]** Update the checklist   **[S]** Skip

   - **[R]**: Run mode (steps 8–13).
   - **[U]**: Setup mode with existing file loaded (steps 2–7).
   - **[S]**: return to orchestrator or end.

---

### Setup mode

2. Read `taproot/global-truths/security-context_intent.md` if it exists to load stack and threat profile.

3. Present standard audit categories. For each, ask whether it applies and confirm the cadence. Offer **[?] Get help**:

   > **Dependency currency**
   > Are project dependencies up to date and free of known CVEs?
   >
   > - Include in checklist? (yes/skip)   Cadence if yes? (monthly / before each release / quarterly)
   >
   > **[?]** Get help

   > **Secret rotation**
   > Are secrets and credentials rotated on schedule?
   >
   > - Include? Cadence? (monthly / quarterly / annually / per policy)
   >
   > **[?]** Get help

   > **Threat model refresh**
   > Has the threat model been reviewed since the last major feature or architectural change?
   >
   > - Include? Cadence? (quarterly / before each major release / annually)
   >
   > **[?]** Get help

   > **Custom audit items**
   > Any project-specific items to include? (e.g. licence compliance, third-party API key review, access log audit)
   > Add any, or skip.

   On **[?]**: scan project for evidence (dep files, secret patterns, existing threat model docs), propose item + cadence with reasoning; developer confirms.

4. Draft `security-periodic-review_behaviour.md`:

   ```markdown
   ## Periodic security review checklist

   ### Dependency currency
   - **Cadence:** [value or "not configured"]
   - **Last reviewed:** —
   - **Check:** Scan dependencies for known CVEs. Run the configured dep audit tool and review output.

   ### Secret rotation
   - **Cadence:** [value or "not configured"]
   - **Last reviewed:** —
   - **Check:** Verify secrets are rotated per policy. Check rotation dates in secrets manager or team records.

   ### Threat model refresh
   - **Cadence:** [value or "not configured"]
   - **Last reviewed:** —
   - **Check:** Review the threat model against recent feature additions and architectural changes. Update if significant new attack surfaces were introduced.

   [Custom items...]
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft review checklist ready.
   > **[A]** Write (or extend if existing)   **[B]** Replace existing   **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/security-periodic-review_behaviour.md`. Report path written.

7. If invoked from `/tr-security-define`: return control to orchestrator.

   Otherwise:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   > **What's next?**
   > [1] `/tr-security-periodic-review --run` — run the review now
   > [2] `/tr-security-define` — return to module orchestrator
   > [3] `/tr-commit` — commit the new truth file

---

### Run mode

8. Load `security-periodic-review_behaviour.md`. List all configured audit items with their cadence and last-reviewed date:

   ```
   Periodic security review
   ���────────────────────────────────────────────────────────────
    item                  cadence     last reviewed   status
   ──────────────────��──────────────────────────────────────────
    dependency currency   monthly     2026-03-01      ⚠ overdue
    secret rotation       quarterly   2026-01-15      ✓ current
    threat model refresh  quarterly   2026-01-15      ✓ current
   ─────────────────────────────────────────────────────────────
   ```

   Highlight overdue items (last reviewed + cadence < today).

9. For each audit item in sequence:

   **Dependency currency:**
   - Run or invoke the configured dep audit tool (from `security-local-tooling_behaviour.md` if configured)
   - Report: number of deps checked, CVEs found (by severity), outdated deps
   - Surface any critical or high findings with package name, CVE ID, and fix version

   **Secret rotation:**
   - Ask the developer to confirm rotation status for each secret type or check rotation records if accessible
   - Surface any secrets that appear overdue based on the configured cadence

   **Threat model refresh:**
   - Scan git log for significant feature additions or architectural changes since last review
   - Report what was found and ask: "Have any new attack surfaces been introduced that require a threat model update?"
   - If yes: note the specific areas for update and suggest `/tr-refine` on the relevant spec

   **Custom items:**
   - Run each configured custom check per its defined instructions

10. For each item: mark as `✓ pass`, `⚠ findings`, or `— could not assess` (with reason).

11. Present summary report:

    > **Review complete — [date]**
    >
    > | Item | Result | Action |
    > |------|--------|--------|
    > | Dependency currency | ⚠ 2 critical CVEs | Update lodash to 4.17.22, express to 4.20.0 |
    > | Secret rotation | ✓ pass | — |
    > | Threat model refresh | ✓ pass | — |

12. Update `security-periodic-review_behaviour.md`: set `**Last reviewed:** [today]` for each completed item.

13. Report: "✓ Review dates updated in `security-periodic-review_behaviour.md`."

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-commit` — commit the updated truth file with new review dates
> [2] `/tr-security-periodic-review` — view the checklist and schedule the next review

## Output

**Setup:** `taproot/global-truths/security-periodic-review_behaviour.md` — audit checklist with cadence.
**Run:** updated last-reviewed dates in the truth file; summary report presented in session.

## CLI Dependencies

None.

## Notes

- If invoked in setup mode from `/tr-security-define`, skip the What's next block and return control to the orchestrator.
- Run mode does not block on items that cannot be assessed — it notes the reason and continues. This mirrors the `/tr-sweep` pattern.
- The truth file's `Last reviewed` dates persist between sessions, so overdue detection works correctly across multiple invocations.
