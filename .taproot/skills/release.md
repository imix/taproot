# Skill: release

## Description

Run the taproot maintainer's local release phase: pre-flight checks, changelog generation, version bump, commit, tag, and push. Triggers GitHub Actions CI to build, gate on approval, and publish. Not distributed to user projects.

## Inputs

- `bump` (required): Version bump type — `patch`, `minor`, or `major`.

## Steps

1. Confirm `bump` is one of `patch`, `minor`, `major`. If missing or invalid, report: "Usage: `/tr-release patch|minor|major`" and stop.

2. **Pre-flight checks** — run each check in order. Abort on the first failure, reporting the check name and what to fix. Do not modify any files during this phase.

   a. Run `git fetch origin` then `git status -sb`. If the output contains `behind`, report: "Local branch is behind origin/main. Run `git pull` before releasing." and stop.

   b. Run `npm test`. If exit code is non-zero, report the failing test output and stop.

   c. Run `npm audit --audit-level=high`. If exit code is non-zero, report the vulnerable packages and stop.

   d. Run `npm run build`. If exit code is non-zero, report the build error and stop.

   e. Run `npx taproot validate-structure --path taproot/`. If any errors are reported, stop.

   f. Run `npx taproot sync-check --path taproot/`. If exit code is non-zero (errors, not warnings alone), stop.

   g. Run `npx taproot coverage --path taproot/ --format json` and parse the output. If `totals.completeImpls < totals.implementations`, report: "Not all implementations are complete — [list paths where state is not complete]" and stop.

   h. Run `git status --porcelain`. If any output, report: "Working tree is dirty — commit or stash before releasing: [list files]" and stop.

   i. Read `package.json` and extract the current `version`. Compute the next version by applying `bump`:
      - `patch`: increment the third digit (e.g. `0.1.0` → `0.1.1`)
      - `minor`: increment the second digit, reset third to 0 (e.g. `0.1.3` → `0.2.0`)
      - `major`: increment the first digit, reset second and third to 0 (e.g. `0.2.1` → `1.0.0`)

      Run `git tag -l "v<next>"`. If output is non-empty, report: "Tag v<next> already exists. Choose a different bump type or delete the existing tag first." and stop.

   Report: "✓ All pre-flight checks passed. Releasing v<next>."

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
   > Review changelog for v\<next\>. **[Y]** proceed · **[E]** edit `CHANGELOG.md` directly then reply Y · **[Q]** abort

   - **[Q]**: report "Release aborted — no files modified." and stop.
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

4. **Version bump** — update the `version` field in `package.json` to `<next>`. Write the file with the same formatting (2-space indent, trailing newline). Verify by re-reading the file.

5. **Commit** — this is a **plain commit** (message `chore: release v<next>` does not match the `taproot(<scope>):` pattern). The taproot pre-commit hook classifies it as plain and runs no DoD or DoR conditions. Stage and commit:
   ```
   git add package.json CHANGELOG.md
   git commit -m "chore: release v<next>"
   ```
   If the commit is blocked by the pre-commit hook, report the hook output verbatim and stop. Do not bypass the hook (`--no-verify`).

6. **Tag** — create the release tag:
   ```
   git tag v<next>
   ```

7. **Push** — push the commit and tag to origin:
   ```
   git push origin main && git push origin v<next>
   ```
   If the push fails, report: "local commit ✓ · local tag `v<next>` ✓ — push failed: `<error>`. Retry with: `git push origin main && git push origin v<next>`" and stop.

8. Report release initiated:
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

- `package.json` version bumped to `<next>`
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
