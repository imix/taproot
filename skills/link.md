# Skill: link

## Description

Create a cross-repo link file (`link.md`) that references a spec — intent, behaviour, or global truth — in another repository. The link file is the mechanism by which a linking repo claims traceability to a source repo's requirements without duplicating them.

## Inputs

- `target` (optional): shorthand in the form `<repo-url> <path-in-source-repo> <type>` — if provided, skips the interactive dialogue and goes straight to placement.

## Steps

0. **Identify which side you're on.** Cross-repo linking is a two-sided workflow:

   - **Linking repo** (you are implementing a spec or referencing a truth that lives in another repo): create a `link.md` — steps 1–7 below.
   - **Source repo** (your spec is being implemented by a linking repo, or your truth is being referenced): create a `delegated` impl.md (behaviour/intent links) or structure the truth file correctly (truth links) — jump to the **Source repo side** section now.
   - **Both repos at once** (setting up the full connection from scratch): start with the **Source repo side** section, then return to step 1 for the linking repo side.

   If it's unclear, ask: "Are you in the repo that *owns* the shared spec or truth, the repo that *implements or references* it, or setting up both?"

   → If **source repo only or both repos**: skip steps 1–7 and go to **Source repo side** first.

1. **Gather link details.** If `target` was provided, parse the three fields. Otherwise ask:

   > "What spec do you want to link to?"
   > - **Repo URL**: GitHub URL of the source repo (e.g. `https://github.com/org/platform-repo`)
   > - **Path**: path to the target spec within the source repo (e.g. `taproot/specs/authentication/plugin-login/usecase.md`)
   > - **Type**: `behaviour`, `intent`, or `truth` — determines how `taproot coverage` counts this link; `truth` links are also enforced at commit time via the truth-check hook
   > - **Description** (optional): one line on why this link exists and what this repo is responsible for

   Wait for all required fields before continuing.

2. **Determine placement in the local hierarchy.** Suggest a placement that mirrors the target path structure:
   - For a `behaviour` link targeting `taproot/specs/<intent>/<behaviour>/usecase.md` → suggest `taproot/specs/<intent>/<behaviour>/link.md`
   - For an `intent` link targeting `taproot/specs/<intent>/intent.md` → suggest `taproot/specs/<intent>/link.md`
   - For a `truth` link → suggest `taproot/global-truths/<name>-link.md` (truth links are placed in global-truths, not specs — the truth-check hook scans there at commit time)

   Present the suggestion:
   > "I'll place the link file at `<suggested-path>`. Does this location make sense, or would you like to put it somewhere else?"

   If the folder does not yet exist, note: "I'll create `<folder>` — this folder will hold the link file and any local impl.md that claims responsibility for the linked behaviour."

   Wait for confirmation or an alternate path before writing.

3. **Derive a descriptive title** from the target path (e.g. `taproot/specs/auth/plugin-login/usecase.md` → "Plugin Login"). Use it in the `# Link:` heading.

4. **Write the link file** at the confirmed path:

   ```markdown
   # Link: <title>

   **Repo:** <repo-url>
   **Path:** <path-in-source-repo>
   **Type:** <type>

   **Description:** <description>
   ```

   Omit the `**Description:**` line if no description was provided.

5. **Check for `.taproot/repos.yaml`.** This file maps repo URLs to local filesystem paths, enabling `taproot check-orphans` and `taproot coverage` to resolve links locally.

   - If `.taproot/repos.yaml` does not exist, offer:
     > "`taproot check-orphans` and `taproot coverage` can resolve this link locally if you configure `.taproot/repos.yaml`. This file is gitignored — each developer maintains their own. Want me to create it now?
     > [Y] Create `.taproot/repos.yaml` · [N] Skip (resolve online or configure later)"
     >
     > If [Y]: ask for the local path to the source repo clone, then write:
     > ```yaml
     > "<repo-url>": "/local/path/to/source-repo"
     > ```
     > Note: "`.taproot/` is gitignored — `repos.yaml` will not be committed."

   - If `.taproot/repos.yaml` already exists but does not contain an entry for this repo URL, offer to append the entry.

   - If the entry already exists, skip silently.

6. **Validate** the link file:
   ```
   taproot validate-format --path <link-file-dir>
   ```
   Fix any validation errors before proceeding.

7. **Explain the coverage connection.** After creating the link file, explain what's needed to have coverage count this link as implemented:
   > "The link is created. To count it as implemented in `taproot coverage`, create a local `impl.md` in the same folder (`<folder>/impl.md`) that lists the link file in `## Source Files` with state `complete`. Without a local `impl.md`, the linked behaviour appears as a coverage gap — which is correct until you've actually implemented it."

   Then ask: "Do you also need to update the **source repo** to mark these ACs as delegated? [Y] Guide me through the source repo side · [N] Skip"

   If [Y]: proceed to the **Source repo side** section below.

---

### Source repo side

**S-0.** Check the link type:
- **`behaviour` or `intent` link**: the linking repo is implementing your spec — continue with S-1 through S-5 (delegated impl.md workflow).
- **`truth` link**: the linking repo is enforcing your truth file at commit time — skip S-1 through S-5 and go to **Source repo side — truth link** below.

---

When a spec in the source repo has ACs that are implemented by a linking repo, create a `delegated` impl.md in the source repo so its coverage stays clean.

**S-1.** Ask: "Which ACs in the source repo's spec are delegated to the linking repo, and which (if any) are implemented locally?"

**S-2.** If some ACs are implemented locally: a standard `complete` impl.md for those ACs already exists (or will be created normally). No change needed for local ACs.

**S-3.** For the delegated ACs, create an `impl.md` under the source repo's behaviour folder (e.g. `<intent>/<behaviour>/linking-repo-impl/impl.md`):

   ```markdown
   # Implementation: <linking-repo-name> (delegated)

   ## Behaviour
   ../usecase.md

   ## Design Decisions
   - ACs <list> are implemented in <linking-repo-name> (<repo-url>).
   - Source files live in the linking repo; this impl.md records the delegation for coverage completeness.

   ## Source Files
   - (none — source files live in <linking-repo-name>)

   ## Commits
   - (none)

   ## Tests
   - (none — verified in the linking repo)

   ## Status
   - **State:** delegated
   - **Created:** <date>
   - **Last verified:** <date>
   ```

**S-4.** Confirm `delegated` is in `allowed_impl_states` in `taproot/settings.yaml`. If not, add it:
   ```yaml
   allowed_impl_states:
     - complete
     - in-progress
     - delegated
     # ...
   ```

**S-5.** Commit the delegated impl.md as a declaration commit in the source repo.

---

### Source repo side — truth link

When the link type is `truth`, the source repo's role is to own and maintain the truth file. No delegated impl.md is needed — truth links are commit-time enforcement hooks, not coverage records.

**T-1.** Locate or create the truth file in `taproot/global-truths/`. Use a filename that encodes the scope:
- `<name>_intent.md` — enforced at intent, behaviour, and impl level (broadest; use for domain models, glossaries, business rules)
- `<name>_behaviour.md` — enforced at behaviour and impl level
- `<name>_impl.md` — enforced at impl level only (use for API contracts, technology constraints)
- No scope suffix → treated as intent-scoped

**T-2.** Truth files are **plain markdown — no YAML frontmatter**. Do not add a `---` frontmatter block. Scope is determined entirely by the filename suffix, not by any metadata inside the file.

**T-3.** Write the truth file to be self-contained and unambiguous. It is read verbatim by the agent at commit time in the linking repo — the agent must be able to check conformance without fetching any other file.

**T-4.** Do not cross-reference files in the linking repo from within the truth. The linking repo links *to* the truth; the truth must not depend on files in the linking repo. A back-reference creates a circular dependency that breaks offline resolution and creates fragile coupling.

**T-5.** Ask the developer to run `taproot check-orphans` in the linking repo (with `repos.yaml` configured) to confirm the truth link resolves correctly.

> Truth links do not affect coverage in either repo. The linking repo's commit hook enforces the truth at commit time; the source repo's coverage is unaffected.

> If the linking repo's local changes require the truth file to be updated, surface a cross-repo handoff rather than editing the truth directly — see the **Cross-repo change handoff** pattern in `taproot/agent/docs/patterns.md`.

---

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

**What's next?**
[1] `/tr-implement <folder>/` — create a local impl.md to claim this linked behaviour (linking repo side)
[2] `/tr-commit` — commit the link file and/or delegated impl.md
[3] Run `taproot check-orphans` after configuring `repos.yaml` to verify the link resolves

## Output

- A `link.md` file (or `<name>-link.md`) written to the confirmed path
- Optionally, `.taproot/repos.yaml` created or updated with the repo mapping

## CLI Dependencies

- `taproot validate-format`

## Notes

- Link file name is `link.md` by convention. Use a descriptive name (e.g. `platform-auth-link.md`) only when a folder contains multiple links — an uncommon case.
- The `Type` field controls how `taproot coverage` counts the link: `behaviour` and `truth` links affect behaviour-level coverage; `intent` links count toward intent-level coverage.
- `repos.yaml` is gitignored by design — it is a developer-local mapping to local clones, not a committed project configuration. Each team member configures their own copy. Set `TAPROOT_OFFLINE=1` in CI to skip link resolution where `repos.yaml` cannot exist.
- A link file alone does not claim implementation — it only asserts that a spec from another repo is relevant to this repo. A local `impl.md` referencing the link file in `## Source Files` is the traceability record.
- `Type: truth` links are special: they live in `taproot/global-truths/` (not `taproot/specs/`), and the truth-check hook reads and enforces them at commit time — just like local truths. If repos.yaml cannot resolve the target, the commit is blocked unless `TAPROOT_OFFLINE=1`.
- Full two-repo connection summary: **Source repo** creates `delegated` impl.md (notes linking repo + covered ACs). **Linking repo** creates `link.md` + local `impl.md` (lists link file in Source Files). Both coverage reports stay clean.
