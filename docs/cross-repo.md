# Cross-Repo Specification

When a system spans multiple repositories, requirements shouldn't live in just one of them — or worse, be duplicated in each. Taproot's cross-repo linking lets one repo own a spec while other repos implement it locally, with full traceability and independent coverage reporting on each side.

---

## The core idea

A **link file** is a single markdown file placed in a linking repo's hierarchy that points to a spec in another repo. It says: "this repo is aware of that requirement, and here is where our implementation record lives."

```
platform-repo/
  taproot/specs/auth/plugin-login/
    usecase.md        ← the spec lives here
    platform-impl/
      impl.md         ← platform's own implementation

plugin-repo/
  taproot/specs/auth/plugin-login/
    link.md           ← points back to platform-repo's usecase.md
    plugin-impl/
      impl.md         ← plugin's local implementation (lists link.md in Source Files)
```

The spec is defined once. Each repo has its own implementation record. Each repo's `taproot coverage` runs independently and stays clean.

---

## Scenarios

### Scenario A — Main repo with code + linked satellite repos

The most common setup. One repo owns the shared specs and also implements some of them. Other repos implement the rest.

```
platform-repo/                        ← owns shared specs + platform-side code
  taproot/specs/
    auth/
      plugin-login/
        usecase.md                    ← shared spec
        platform-side/impl.md         ← state: complete (platform's ACs)
        plugin-side/impl.md           ← state: delegated (plugin's ACs)
    api-contract/
      global-truths/
        api-schema_intent.md          ← shared truth: API shape

plugin-repo/                          ← implements plugin-login locally
  taproot/specs/
    auth/
      plugin-login/
        link.md                       ← links to platform-repo's usecase.md
        local-impl/impl.md            ← state: complete
  taproot/global-truths/
    api-schema-link.md                ← truth link → platform-repo's api-schema_intent.md
```

**How it works:**
- `taproot coverage` in platform-repo counts `plugin-login` as fully covered: one `complete` impl (platform side) + one `delegated` impl (plugin side).
- `taproot coverage` in plugin-repo counts `plugin-login` as implemented via the local `impl.md` that references `link.md`.
- The truth-check hook in plugin-repo enforces `api-schema_intent.md` at every spec commit — even though the file lives in platform-repo.

---

### Scenario B — Pure coordination repo (no code of its own)

A dedicated requirements repo that owns all shared specs. All implementing repos link to it. The coordination repo itself has no source code.

```
requirements-repo/                    ← owns all shared specs; no code
  taproot/specs/
    checkout/
      apply-discount/usecase.md
      apply-discount/web-impl.md      ← state: delegated (web-repo's ACs)
      apply-discount/mobile-impl.md   ← state: delegated (mobile-repo's ACs)
    payments/
      process-payment/usecase.md
      process-payment/gateway-impl.md ← state: delegated
  taproot/global-truths/
    pricing-rules_intent.md           ← canonical pricing rules
    order-states_intent.md            ← canonical order state machine

web-repo/
  taproot/specs/checkout/apply-discount/
    link.md                           ← → requirements-repo's usecase.md
    impl/impl.md                      ← state: complete

mobile-repo/
  taproot/specs/checkout/apply-discount/
    link.md                           ← → requirements-repo's usecase.md
    impl/impl.md                      ← state: complete
```

**What the coordination repo gains:**
- Full coverage visibility across all repos from a single hierarchy
- Every `delegated` impl names which repo handles it and which ACs
- Requirements can be refined once without touching any implementation repo

**What each implementing repo gains:**
- Independent coverage: `taproot coverage` in web-repo shows its own complete/pending status
- Independent CI: `taproot check-orphans` in each repo verifies its own links
- Shared truths: `pricing-rules_intent.md` is enforced in each implementing repo at commit time

---

### Scenario C — Shared global truths only

Sometimes repos don't need to share specs — they just need to share a domain model, API contract, or naming convention. Truth links handle this without requiring a full spec hierarchy in the source repo.

```
platform-repo/
  taproot/global-truths/
    api-contract_intent.md    ← canonical REST API shape (field names, status codes)
    domain-model_intent.md    ← canonical entity definitions

service-a-repo/
  taproot/global-truths/
    api-contract-link.md      ← Type: truth → platform-repo's api-contract_intent.md
    domain-model-link.md      ← Type: truth → platform-repo's domain-model_intent.md

service-b-repo/
  taproot/global-truths/
    api-contract-link.md      ← same truth, independent link
```

**At commit time:** when a developer in service-a-repo commits a spec that uses a field name inconsistently with `api-contract_intent.md`, the truth-check hook blocks the commit — even though the truth file is in platform-repo. The hook resolves the link via `repos.yaml` and validates locally.

---

## Link file format

A link file is a plain markdown file placed alongside the behaviour or inside `taproot/global-truths/`:

```markdown
# Link: Plugin Login

**Repo:** https://github.com/org/platform-repo
**Path:** taproot/specs/auth/plugin-login/usecase.md
**Type:** behaviour

**Description:** Plugin repo implements the auth handoff ACs (AC-3, AC-4). Platform handles session management (AC-1, AC-2).
```

| Field | Required | Values | Effect |
|-------|----------|--------|--------|
| `Repo` | ✓ | GitHub URL | Identifies the source repo; mapped in `repos.yaml` for local resolution |
| `Path` | ✓ | Path in source repo | Points to `usecase.md`, `intent.md`, or a truth file |
| `Type` | ✓ | `behaviour`, `intent`, `truth` | Controls how coverage counts the link; `truth` triggers commit-time enforcement |
| `Description` | — | Free text | Documents why the link exists and which ACs this repo is responsible for |

**File naming:**
- `link.md` — standard name when a folder has one link
- `platform-auth-link.md` — use a descriptive name when a folder contains multiple links

**Placement:**
- `behaviour` / `intent` links → place alongside the matching spec folder: `taproot/specs/<intent>/<behaviour>/link.md`
- `truth` links → place in `taproot/global-truths/`: `taproot/global-truths/<name>-link.md`

---

## The two-sided workflow

Cross-repo linking always involves two repos. Both sides need to be set up for coverage to be clean on both ends.

### Linking repo side (you are implementing a spec from another repo)

1. Create `link.md` in the appropriate folder:
   ```markdown
   # Link: <Title>
   **Repo:** https://github.com/org/source-repo
   **Path:** taproot/specs/auth/plugin-login/usecase.md
   **Type:** behaviour
   ```
2. Create a local `impl.md` in the same folder that lists the link file in `## Source Files`:
   ```markdown
   ## Source Files
   - `../link.md` — linked spec from platform-repo
   - `src/auth/plugin-login.ts` — local implementation
   ```
3. Set `**State:** complete` when done. `taproot coverage` counts the linked behaviour as implemented.

### Source repo side (your spec is implemented by a linking repo)

Create a `delegated` impl.md so coverage stays clean in your repo too:

```markdown
# Implementation: plugin-repo (delegated)

## Behaviour
../usecase.md

## Design Decisions
- AC-3 (auth handoff) and AC-4 (token exchange) are implemented in plugin-repo.
- Source files live in plugin-repo; this record exists for coverage completeness.

## Source Files
- (none — source files live in plugin-repo)

## Status
- **State:** delegated
```

**Why this matters:** without the `delegated` impl.md, the source repo's `taproot coverage` shows the behaviour as a gap — even though it's properly implemented in the linking repo. With it, both repos show clean coverage.

Use `/tr-link` to be guided through both sides interactively.

---

## How coverage works

`taproot coverage` counts linked items based entirely on the **local** impl.md state — no remote fetching required:

| Local state | Coverage result |
|-------------|----------------|
| `impl.md` lists link in Source Files, `state: complete` | ✓ Implemented — `[linked]` |
| `impl.md` lists link in Source Files, `state: in-progress` | ⏳ Pending — `[linked]` |
| No `impl.md` references the link file | ✗ Gap — `[linked]` |
| `impl.md` with `state: delegated` (source repo) | ✓ Delegated — counted as covered |

Intent-type links count toward intent-level coverage; behaviour and truth links count toward behaviour-level coverage.

---

## Local resolution with `repos.yaml`

`taproot check-orphans` and `taproot coverage` can display resolved link targets if you configure a local mapping. This file is **gitignored** — each developer maintains their own copy.

Create `.taproot/repos.yaml`:

```yaml
"https://github.com/org/platform-repo": "/Users/you/code/platform-repo"
"https://github.com/org/requirements-repo": "/Users/you/code/requirements-repo"
```

Without `repos.yaml`, coverage counting still works (it's based on local impl.md state). You'll see `⚠ unresolvable` warnings in coverage output for any links that can't be resolved — these are display-only and don't affect counts.

---

## CI setup

`repos.yaml` is gitignored and cannot exist in CI. Set `TAPROOT_OFFLINE=1` to skip link resolution:

```yaml
# .github/workflows/taproot.yml
- name: Validate
  run: taproot validate-structure && taproot validate-format
  env:
    TAPROOT_OFFLINE: "1"
```

With `TAPROOT_OFFLINE=1`:
- `taproot check-orphans` skips link resolution (emits a count of skipped links)
- The truth-check hook skips linked truth validation
- Coverage counting is unaffected (local impl.md state only)

Each repo's CI validates its own hierarchy independently. There is no cross-repo CI aggregation in v1.

---

## What `/tr-link` does

The `/tr-link` skill guides the full setup interactively:

```
/tr-link
```

It asks which side you're on (linking repo, source repo, or both), gathers the repo URL / path / type, suggests placement, creates the link file, optionally sets up `repos.yaml`, and walks you through creating the `delegated` impl.md in the source repo if needed.

---

## Checklist: setting up a new cross-repo link

**In the linking repo:**
- [ ] Create `link.md` with `Repo`, `Path`, `Type`
- [ ] Create local `impl.md` listing `link.md` in `## Source Files`
- [ ] Add entry to `.taproot/repos.yaml` (local, not committed)
- [ ] Run `taproot check-orphans` to verify the link resolves
- [ ] Commit link file + impl.md

**In the source repo:**
- [ ] Create `delegated` impl.md naming the linking repo and covered ACs
- [ ] Ensure `delegated` is in `allowed_impl_states` in `taproot/settings.yaml`
- [ ] Commit the delegated impl.md

**For truth links (additionally):**
- [ ] Place truth link file in `taproot/global-truths/` (not `taproot/specs/`)
- [ ] Verify the truth-check hook resolves it: commit a hierarchy file and check for truth-check output
