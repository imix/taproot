# Skill Output Patterns

Skill files declare output interactions using named patterns instead of raw rendering instructions. Each agent adapter translates patterns to its optimal rendering strategy — ensuring action prompts are always visible regardless of the agent's UI limitations.

## Why patterns exist

Different agents render output differently. Claude Code displays full content inline; Gemini CLI truncates at ~8K tokens, hiding action prompts below the fold. A pattern declaration says **what** to present; each adapter defines **how** to render it for that agent's UI.

## Pattern types

### `artifact-review`

Present a file for developer review, then prompt for an action.

**Skill author writes:**
```markdown
> **[artifact-review]** Written to `<path>` — <one-line summary>
> **[A]** Accept  **[B]** Edit  **[R]** Review full content
```

**Claude Code rendering:**
- Read the file and display its full contents inline
- Follow immediately with the action prompt — no intervening text

**Gemini rendering:**
- File is already written to disk — confirm the path
- Show a short summary: word count, section headings, key metrics if parseable
- Show the action prompt, with `[R]` loading the full file on request

**Fallback (unknown adapter):**
- Show the summary line and action prompt
- Offer to display the full content if the developer selects `[R]`

---

### `confirmation`

Present a question with a small set of action options. Used for yes/no decisions and multi-choice branch points.

**Skill author writes:**
```markdown
> <question text>
> **[A]** <yes/proceed label>  **[B]** <alternative>  **[C]** Cancel
```

**All adapters:** Display the question and options in a single visible block. Wait for developer input before proceeding.

---

### `progress`

Announce a long-running step with no required response. Used to communicate that work is in flight.

**Skill author writes:**
```markdown
> ⏳ <what is happening — one sentence>
```

**All adapters:** Display as an informational line. No prompt, no wait. Continue immediately to the next step.

---

### `next-steps`

Present a numbered menu of follow-on actions at the end of a skill or sub-flow.

**Skill author writes:**
```markdown
**What's next?**
[1] `/tr-<skill> <abbreviated-path>` — <description>
[2] `/tr-<skill>` — <description>
```

**All adapters:** Display as a numbered list. Developer responds with a number or ignores the prompt. Numbers are positional — do not assign fixed semantic meaning to specific numbers (see `global-truths/ux-principles_intent.md`).

---

## Declaration rules

1. **Use a pattern, not raw instructions.** Do not write "print the full spec", "display the file contents", or "show the user". Use a named pattern block.
2. **One action prompt per turn.** Never stack two confirmation or artifact-review blocks without a developer response in between.
3. **Action labels follow the global convention.** Letters (`[A]`, `[C]`, `[R]`, `[D]`, `[L]`, `[X]`, `[B]`, `[P]`) carry fixed semantic meaning across all skills. See `global-truths/ux-principles_intent.md` for the full table.
4. **Max 4 options per prompt.** If more than 4 actions are needed, collapse related options or use a numbered `next-steps` menu instead.
5. **Unknown pattern type:** If an adapter encounters a pattern name it does not recognize, it falls back to: show the summary line and action options, offer to read full content on request.

---

## Adding a new pattern type

1. Define the pattern in this file: name, skill syntax, per-adapter rendering, fallback behavior
2. Add a row to the "Built-in conditions" table in `docs/configuration.md`
3. Commit as a requirement change (`refine(agent-integration/portable-output-patterns):`)

Do not create patterns for one-off interactions — new patterns should solve a recurring output problem across multiple skills.

---

## Enforcement

The `check-if-affected-by: agent-integration/portable-output-patterns` DoD condition fires when a skill file (`skills/*.md`) is staged. The agent reads this document, reviews the staged diff for raw rendering instructions, and flags any violations before the commit proceeds.

Raw rendering instruction signals the gate looks for:
- "print the full…", "display the contents of…", "show the user the file"
- Adapter-specific language in a shared skill file ("Claude will show…", "Gemini should write to disk…")
- Inline content rendering without a pattern label
