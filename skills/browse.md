# Skill: browse

## Description

Read a taproot hierarchy document section by section in the terminal — without opening an external editor. Presents each section one at a time, offers inline editing via `[M] Modify`, and lists what's below at the end. Distinct from `/tr-review` (which is an agent-driven critique); browse is the developer reading the spec themselves.

## Inputs

- `path` (required): Path to a hierarchy document (`intent.md`, `usecase.md`, or `impl.md`) or the folder containing one.

## Steps

1. **Resolve the target document.**
   - If `path` points directly to a file (`intent.md`, `usecase.md`, or `impl.md`): use it as-is.
   - If `path` points to a folder: look for `intent.md`, then `usecase.md`, then `impl.md` at that exact folder level (not in subfolders). Child impl folders are children to list later — they are not the target document.
   - If no hierarchy document is found: report *"No intent.md, usecase.md, or impl.md found at `<path>`"* and stop.
   - If the path does not exist: report *"No file found at `<path>` — check the path and try again"* and stop.

2. **Check for discussion.md.** Look for `discussion.md` in the same folder as the resolved document.
   - If present and has substantive content (not just template headings): announce *"📝 Discussion notes found — I'll include context from them where relevant"*
   - If absent or skeleton-only: skip silently — no announcement, no placeholder.

3. **Determine the document type** (`intent.md`, `usecase.md`, or `impl.md`) and identify the section order by reading the document.

4. **Present sections one at a time.** For each section:

   a. Display the section heading and body, formatted to fit a terminal screen.

   b. **Discussion context** — if `discussion.md` is present and substantive, insert a `> How we got here:` block at the following anchor (only once per browse session):
      - `usecase.md`: before the `## Main Flow` section
      - `impl.md`: alongside `## Design Decisions`
      - `intent.md`: alongside `## Goal`

   c. **Long section** — if the section body exceeds approximately 20 lines:
      - Present the first ~20 lines, then offer: `[C] See more | [D] Done with this section`
      - `[C]`: present the next ~20 lines; repeat until exhausted
      - `[D]`: treat the section as complete and continue to step 4d

   d. After displaying the section (or completing pagination), offer:

      > `[C] Continue   [M] Modify   [S] Skip to children`

5. **Handle developer choice:**

   **[C] Continue** — present the next section (repeat step 4). When all sections are shown, proceed to step 6.

   **[M] Modify** — ask: *"What would you like to change in this section?"*
   - If the section is `## Commits` or `## DoD Resolutions` in an `impl.md`: first warn *"⚠ This section is managed by `taproot link-commits` / `taproot dod` — manual edits may be overwritten on the next run. Continue?"* and wait for confirmation before proceeding.
   - Developer states the change. Apply it to the file and show the updated section.
   - If the developer says "never mind" or equivalent: confirm *"No changes — continuing"* and return to step 4d.
   - After applying the change, return to step 4d with the updated section displayed.

   **[S] Skip to children** — skip remaining sections and proceed directly to step 6.

6. **Show what's below:**
   - **intent.md**: list child behaviours — name and relative path to each `usecase.md`
   - **usecase.md**: list implementations — name and relative path to each `impl.md`
   - **impl.md**: *"No children — this is a leaf implementation."*

   To go deeper into any child, the developer calls `/tr-browse <child-path>`.

7. Present next steps:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

   **What's next?**
   [A] `/tr-browse <child-path>` — go deeper into one of the listed children
   [B] `/tr-implement <path>/` — start building (if browsing a behaviour spec)
   [C] `/tr-review <path>` — get an agent critique of the spec

## Output

The developer has read the document section by section in the terminal. Any `[M]` edits are saved to the file. The developer knows what's below without opening any additional files.

## CLI Dependencies

None

## Notes

- Browse is read-and-light-edit, not a stress-test. Resist the urge to comment on spec quality — the developer is reading, not asking for a critique. Use `/tr-review` for that.
- The ~20-line pagination threshold is a guideline. Use judgment — a section with 22 short lines may be fine to show in full; a section with 15 very long lines may need pagination.
- The `> How we got here:` block is shown once per browse session at the designated anchor, not repeated for every section.
- After [M] edits, the file on disk is updated but no git staging is performed — the developer commits when ready.
