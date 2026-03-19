# UseCase: Pre-commit Enforcement

## Actor
Git — triggered automatically when any contributor (human or agent) runs `git commit`

## Preconditions
- `taproot init --with-hooks` has been run, installing `.git/hooks/pre-commit`
- The commit includes changes to the `taproot/` directory

## Main Flow
1. Contributor stages changes and runs `git commit`
2. Git invokes `.git/hooks/pre-commit` before writing the commit
3. Hook runs `taproot validate-structure`
4. Hook runs `taproot validate-format`
5. If both pass (exit 0), the commit proceeds normally
6. If either fails (exit 1), git aborts the commit and prints the violation report

## Alternate Flows
- **No taproot changes in commit**: validation still runs unconditionally against all marker files — passes quickly if the hierarchy is valid, regardless of what was staged
- **CI enforcement**: CI pipeline runs the same commands on PRs as a read-only check (does not block local commits, only merges)
- **Existing pre-commit hook**: `taproot init --with-hooks` appends the taproot check to the existing hook file rather than replacing it

## Error Conditions
- **taproot CLI not installed**: hook fails with a "command not found" error — contributor must install taproot globally
- **Hook not executable**: git skips the hook silently — `taproot init --with-hooks` sets the executable bit, but it may be lost on some systems

## Postconditions
- On success: commit is written with a structurally and formally valid hierarchy
- On failure: commit is blocked; contributor fixes violations and re-commits

## Status
- **State:** implemented
- **Created:** 2026-03-19
