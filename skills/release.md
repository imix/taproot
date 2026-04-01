# Skill: release

## Description

Run the taproot maintainer's local release phase: pre-flight checks, changelog generation, then `npm run release -- <version>` to bump versions, commit, tag, and push. Triggers GitHub Actions CI to build, gate on approval, and publish. Not distributed to user projects.

## Inputs

- `bump` (required): Version bump type — `patch`, `minor`, or `major`.

## Steps

1. Confirm `bump` is one of `patch`, `minor`, `major`. If missing or invalid, report: "Usage: `/tr-release patch|minor|major`" and stop.

2. **Pre-flight checks** — run `npm run preflight -- <bump>`. This script runs all checks in order and stops on the first failure:
   - Branch is up to date with origin/main
   - Tests pass (`npm test`)
   - No high-severity audit vulnerabilities
   - Build succeeds (`npm run build`)
   - `taproot validate-structure` clean
   - `taproot sync-check` clean (errors only; warnings are acceptable)
   - All implementations complete or deferred (`taproot coverage --show-incomplete` to diagnose)
   - Working tree clean
   - Next version computed (v\<current\> → v\<next\>) and tag v\<next\> available

   If the script exits non-zero, it prints the failing check and what to fix. Do not proceed until it exits 0.

   **If the coverage check fails:** run `taproot coverage --show-incomplete` to list the impls. Either complete them or set their `**State:**` to `deferred` in their `impl.md` if the work is intentionally punted. Commit the state change, then re-run preflight.

   Extract v\<next\> from the final line of the script output.

   Report: "✓ All pre-flight checks passed. Releasing v\<next\>."

3. **Changelog generation** — run `git describe --tags --abbrev=0 2>/dev/null` to find the most recent tag. If no tags exist (first release), use the full history.

   Run `git log <last-tag>..HEAD --oneline --no-merges` (or `git log --oneline --no-merges` for first release) to collect commits.

   Group commits into sections (omit empty sections):
   - Commits matching `taproot(...)`: ...` → **Taproot**
   - Commits starting with `feat:` or `feat(` → **Features**
   - Commits starting with `fix:` or `fix(` → **Bug Fixes**
   - Commits starting with `docs:` or `chore:` → **Maintenance**
   - All remaining commits → **Other**

   Format today's date as `YYYY-MM-DD`. Draft the changelog entry:
   ```
   ## [<next>] - <today>

   ### Taproot
   - taproot(scope/path): message (abc1234)

   ### Features
   - feat: description (def5678)
   ```

   Present the entry in the conversation and ask:
   > Review changelog for v\<next\>. **[Y]** proceed · **[E]** edit `CHANGELOG.md` directly then reply Y · **[C]** cancel

   - **[C]**: report "Release aborted — no files modified." and stop.
   - **[E]**: wait for the user to confirm they have finished editing, then re-read the edited `CHANGELOG.md` entry.
   - **[Y]**: write the entry to `CHANGELOG.md`:
     - If `CHANGELOG.md` does not exist, create it:
       ```
       # Changelog

       All notable changes to taproot are documented here.

       <!-- entries below -->

       <entry>
       ```
     - If `CHANGELOG.md` exists and contains `<!-- entries below -->`, insert the new entry on the line immediately after that marker.
     - If `CHANGELOG.md` exists but has no marker, prepend the entry after the first blank line following the `# Changelog` heading.

4. **Run the release script** — this handles version bumps, commit, tag, and push atomically:
   ```
   npm run release -- <next>
   ```
   The script:
   - Verifies `CHANGELOG.md` has an entry for `<next>`
   - Bumps `version` in both `package.json` and `channels/vscode/package.json`
   - Runs `taproot truth-sign` (ensures session is fresh for the hook)
   - Commits `package.json`, `channels/vscode/package.json`, `CHANGELOG.md`, and `taproot/truth-checks.md` with message `chore: release v<next>`
   - Creates tag `v<next>`
   - Pushes commit and tag to `origin/main`

   If the script exits non-zero, it prints the failing check. Do not attempt manual fallback steps — fix the root cause and re-run.

   **Push failure recovery** — if the script fails after creating the local commit and tag but before pushing:
   ```
   git push origin main && git push origin v<next>
   ```

5. Report release initiated:
   ```
   ✓ Local phase complete.

   Tag v<next> pushed to origin/main — GitHub Actions CI workflow triggered.

   Monitor:  gh run watch
   Approve:  github.com/<owner>/taproot/actions  (approve the 'release' environment after CI passes)

   The npm publish and GitHub release will complete after you approve the deployment.
   ```

💡 If this session is getting long, consider running `/compact` or starting a fresh context before monitoring CI.

**Next:** `gh run watch` — monitor CI; approve the `release` environment deployment when checks pass

## Output

- `package.json` and `channels/vscode/package.json` version bumped to `<next>`
- `CHANGELOG.md` entry added for `<next>`
- Release commit on `origin/main` with message `chore: release v<next>`
- Git tag `v<next>` on `origin/main`
- GitHub Actions `release.yml` workflow triggered and awaiting CI checks + maintainer approval

## CLI Dependencies

- `git`
- `npm`
- `npx taproot`

## Notes

- This skill is for the taproot maintainer only. It is not listed in `SKILL_FILES` in `src/commands/init.ts` and is never distributed to user projects by `taproot update`.
- The CI phase (build, `npm publish --provenance`, GitHub release) runs automatically in `.github/workflows/release.yml` after the tag is pushed and the maintainer approves the `release` GitHub Environment deployment.
- If CI fails after the tag is pushed: fix the issue, delete the tag, and re-run — `git push origin :v<next> && git tag -d v<next>`.
- If you need to abort after pushing but before CI approval: delete the remote and local tag — npm publish has not run at that point.
