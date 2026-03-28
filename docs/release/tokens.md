# Release Tokens

Tokens required to cut a taproot release. All expire — rotate before they block CI.

---

## NPM_TOKEN

**Purpose:** Publish `@imix-js/taproot` to npm with provenance
**Used by:** `publish` CI job (`release.yml`)
**Scope:** `Automation` token type, `Read and write` package access
**Expiry:** Set at creation (recommend 1 year)

**Create / rotate:**
1. https://www.npmjs.com/settings/~/tokens
2. Generate New Token → **Granular Access Token**
3. Packages: `@imix-js/taproot` → Read and write
4. Add to repo: https://github.com/imix/taproot/settings/secrets/actions → `NPM_TOKEN`

---

## HOMEBREW_TAP_TOKEN

**Purpose:** Push formula updates to `imix/homebrew-tap` after each release
**Used by:** `update-homebrew-tap` CI job (`release.yml`)
**Scope:** Fine-grained PAT — `imix/homebrew-tap` → Contents: Read and write
**Expiry:** Set at creation (recommend 1 year)

**Create / rotate:**
1. https://github.com/settings/personal-access-tokens/new
2. Resource owner: `imix`
3. Repository access: Only `imix/homebrew-tap`
4. Permissions: Contents → Read and write
5. Add to repo: https://github.com/imix/taproot/settings/secrets/actions → `HOMEBREW_TAP_TOKEN`

---

## VSCE_PAT

**Purpose:** Publish VS Code extension to VS Code Marketplace
**Used by:** `publish-vscode-extension` CI job (`release.yml`)
**Scope:** Azure DevOps PAT — Marketplace: Manage
**Expiry:** Set at creation (max 1 year)
**Publisher:** `imix-ai` at https://marketplace.visualstudio.com/manage/publishers/imix-ai

**Create / rotate:**
1. https://dev.azure.com → User Settings → Personal Access Tokens
2. New Token → Custom defined → Marketplace: Manage
3. Add to repo: https://github.com/imix/taproot/settings/secrets/actions → `VSCE_PAT`

---

## OVSX_PAT

**Purpose:** Publish VS Code extension to Open VSX (optional — non-blocking)
**Used by:** `publish-vscode-extension` CI job (`release.yml`)
**Scope:** Open VSX namespace token
**Expiry:** Varies

**Create / rotate:**
1. https://open-vsx.org → Sign in → Settings → Access Tokens
2. Add to repo: https://github.com/imix/taproot/settings/secrets/actions → `OVSX_PAT`

---

## GITHUB_TOKEN

**Purpose:** Create GitHub releases
**Used by:** `publish` CI job (`release.yml`)
**Scope:** Auto-provided by GitHub Actions — no rotation needed

---

## Secrets dashboard

All secrets in one place:
https://github.com/imix/taproot/settings/secrets/actions
