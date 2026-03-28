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

**Purpose:** Publish VS Code extension to Open VSX Registry (used by Cursor, VSCodium, and other VS Code forks)
**Used by:** `publish-vscode-extension` CI job (`release.yml`) — non-blocking (`continue-on-error: true`)
**Scope:** Open VSX namespace token scoped to the `imix-ai` namespace
**Expiry:** Does not expire (revoke manually if compromised)
**Extension URL:** `open-vsx.org/extension/imix-ai/taproot`

**One-time namespace setup (required before first publish):**
1. Go to https://open-vsx.org and sign in with GitHub
2. Navigate to **User Settings → Namespaces**
3. Create namespace: `imix-ai` (must match `publisher` in `channels/vscode/package.json`)
4. Open VSX may require a manual claim approval — check the namespace status

**Create token:**
1. https://open-vsx.org → User Settings → **Access Tokens**
2. Click **Generate New Token**
3. Description: `taproot-ci`
4. Copy the token immediately (shown only once)

**Add to CI:**
1. https://github.com/imix/taproot/settings/secrets/actions
2. New repository secret → Name: `OVSX_PAT` → Value: token from above

**Verify:** After the next release, check `open-vsx.org/extension/imix-ai/taproot` — propagation is near-instant. If the CI step fails, the error and a manual retry command are printed in the workflow log.

---

## GITHUB_TOKEN

**Purpose:** Create GitHub releases
**Used by:** `publish` CI job (`release.yml`)
**Scope:** Auto-provided by GitHub Actions — no rotation needed

---

## Secrets dashboard

All secrets in one place:
https://github.com/imix/taproot/settings/secrets/actions
