# Skill: backlog

## Description

Capture ideas, findings, and deferred work mid-session with a single command — without interrupting current flow. Called with an argument: captures instantly, no prompts. Called with no argument: opens triage — review each item and discard, keep, or promote to `/tr-ineed`.

## Inputs

- `idea` (optional): One-liner text to capture. If omitted, triage mode opens.

## Steps

### Capture mode (argument present)

1. Detect that an argument was provided.
2. If the argument is blank or whitespace only: warn *"Nothing to capture — provide a description."* and stop.
3. Create `.taproot/backlog.md` if absent. Append the item:
   `- [YYYY-MM-DD] <idea>` using today's date.
4. Confirm in one line: *"✓ Captured: <idea>"*
   No follow-up response required from the developer — the session continues.

### Triage mode (no argument)

1. Read `.taproot/backlog.md`.
   - If absent or contains no standard items: report *"Backlog is empty. Use `/tr-backlog <idea>` to capture something."* and stop.

2. Present items in FIFO order (oldest first). For each line matching `- [YYYY-MM-DD] <text>`, show the date and text, then offer:

   > `[D] Discard   [K] Keep   [P] Promote to /tr-ineed`

3. Handle the choice:
   - **[D] Discard** — remove the item from `.taproot/backlog.md`. Move to the next item.
   - **[K] Keep** — leave the item unchanged. Move to the next item.
   - **[P] Promote** — remove the item from `.taproot/backlog.md`, then invoke `/tr-ineed` with the item text.

4. Non-standard lines (not matching the `- [YYYY-MM-DD] <text>` format): preserve them in the file and skip them during triage. After triage completes, note: *"Skipped N non-standard line(s) — they remain in `.taproot/backlog.md`."* (omit if N = 0).

5. After all items are processed: *"Triage complete — X kept, Y promoted, Z discarded."*

   If the developer exits early: unprocessed items remain in `.taproot/backlog.md` unchanged — no summary shown.

6. Present next steps (triage mode only — skip for capture mode):

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-ineed <idea>` — route a kept item into the hierarchy now
   [B] `/tr-status` — see current project health

## Output

**Capture:** item written to `.taproot/backlog.md`, one-line confirmation.
**Triage:** backlog updated in place; promoted items handed to `/tr-ineed`; completion summary shown.

## CLI Dependencies

None.

## Notes

- Capture is instant — no confirmation, no required fields, no prompts beyond the one-line acknowledgement.
- Item format: `- [YYYY-MM-DD] <text>`. Items are presented FIFO (oldest first) during triage.
- Items promoted via `[P]` are removed from the backlog before `/tr-ineed` is invoked. If the developer abandons the `/tr-ineed` discovery, re-capture the item with `/tr-backlog <idea>`.
- This is a scratchpad, not a project management tool — no priority, labels, or status tracking.
- Storage is `.taproot/backlog.md` — a committed markdown file inside the taproot config directory, versioned with the project.
