# Skill: backlog

## Description

Capture ideas, findings, and deferred work mid-session with a single command — without interrupting current flow. Called with an argument: captures instantly, no prompts. Called with no argument: opens triage — review each item and discard, keep, or promote to `/tr-ineed`.

## Inputs

- `idea` (optional): One-liner text to capture. If omitted, triage mode opens.

## Steps

### Capture mode (argument present)

1. Detect that an argument was provided.
2. If the argument is blank or whitespace only: warn *"Nothing to capture — provide a description."* and stop.
3. Create `taproot/backlog.md` if absent. Append the item:
   `- [YYYY-MM-DD] <idea>` using today's date.
4. Confirm in one line: *"✓ Captured: <idea>"*
   No follow-up response required from the developer — the session continues.

### Triage mode (no argument)

1. Read `taproot/backlog.md`.
   - If absent or contains no standard items: report *"Backlog is empty. Use `/tr-backlog <idea>` to capture something."* and stop.

2. Present all standard items as a numbered list (FIFO order, oldest first):
   ```
   Backlog — N items
    1. [YYYY-MM-DD] item text
    2. [YYYY-MM-DD] item text
   ...
   ```
   Non-standard lines (not matching `- [YYYY-MM-DD] <text>`) are silently skipped in the display but preserved in the file.

3. Offer: `D <n>` discard · `P <n>` promote to /tr-ineed · `A <n>` analyze · `done` finish

4. Accept commands one at a time:
   - **`D <n>`** — remove item n from `taproot/backlog.md`. Confirm: *"✓ Discarded #n"*. Redisplay the updated numbered list.
   - **`P <n>` promote to /tr-ineed** — remove item n from `taproot/backlog.md`. Invoke `/tr-ineed` with the item text. On return, redisplay the updated numbered list.
   - **`A <n>` analyze** — produce a structured analysis of the item:
     - A short description of what the item is or could be (2–4 sentences)
     - A complexity signal: **simple** / **moderate** / **significant**
     - An impact assessment: **minor addition** / **meaningful improvement** / **major capability**
     Then ask: *"[P] Promote to /tr-ineed · [K] Keep · [D] Discard"*. After the choice, redisplay the updated numbered list.
   - **`done`** — end triage. Items not acted on are kept implicitly.

5. After `done`: *"Triage complete — X discarded, Y promoted, Z kept."*
   If any non-standard lines were skipped: *"Skipped N non-standard line(s) — they remain in `taproot/backlog.md`."*

   If the developer exits without `done`: unprocessed items remain unchanged. If any actions were taken, show the summary; otherwise continue naturally.

6. Present next steps (triage mode only — skip for capture mode):

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-ineed <idea>` — route a kept item into the hierarchy now
   [B] `/tr-status` — see current project health

## Output

**Capture:** item written to `taproot/backlog.md`, one-line confirmation.
**Triage:** backlog updated in place; promoted items handed to `/tr-ineed`; completion summary shown.

## CLI Dependencies

None.

## Notes

- Capture is instant — no confirmation, no required fields, no prompts beyond the one-line acknowledgement.
- Item format: `- [YYYY-MM-DD] <text>`. Items are presented FIFO (oldest first) during triage.
- Items promoted via `[P]` are removed from the backlog before `/tr-ineed` is invoked. If the developer abandons the `/tr-ineed` discovery, re-capture the item with `/tr-backlog <idea>`.
- This is a scratchpad, not a project management tool — no priority, labels, or status tracking.
- Storage is `taproot/backlog.md` — a committed markdown file inside the taproot config directory, versioned with the project.
