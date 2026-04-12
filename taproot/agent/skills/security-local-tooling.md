# Skill: security-local-tooling

## Description

Elicit and configure which security scanners the agent runs locally — SAST, secrets scanning, and dependency audit — including when each runs and what constitutes a blocking finding. Writes `security-local-tooling_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `stack` (optional): Language and framework. If omitted, read from `security-context_intent.md` or ask.

## Steps

1. Read `taproot/global-truths/security-context_intent.md` if it exists to load stack.
   Read `taproot/global-truths/security-local-tooling_behaviour.md` if it exists and note current tooling.

2. Scan the project for existing scanner setup:
   - `package.json` scripts for audit/lint/scan entries
   - `.pre-commit-config.yaml` for security hooks
   - `Makefile`, `justfile`, or shell scripts invoking scanners
   - Any existing SAST config files (`semgrep.yaml`, `.bandit`, `.eslintrc` with security plugin)

   Report what was found.

3. Present scanner categories. For each, propose a stack-appropriate default and offer **[H] Get help**:

   > **SAST (static analysis)**
   >
   > Recommended for [stack]: [tool] (e.g. semgrep, bandit, eslint-plugin-security, gosec)
   >
   > - Which tool? (or skip)   **[H]** Get help
   > - When does it run? (pre-commit / on-demand / before PR / all)
   > - What is a blocking finding? (any error / critical only / specific rule categories)

   > **Secrets scanning**
   >
   > Recommended: gitleaks or trufflehog
   >
   > - Which tool? (or skip)   **[H]** Get help
   > - When does it run? (pre-commit / on-demand / before PR / all)
   > - What is a blocking finding? (any detected secret / high-confidence only)

   > **Dependency audit**
   >
   > Recommended for [stack]: [tool] (e.g. npm audit, pip-audit, trivy, snyk, cargo audit)
   >
   > - Which tool? (or skip)   **[H]** Get help
   > - When does it run? (on-demand / before PR / weekly / all)
   > - What is a blocking finding? (critical CVEs / high+critical / any vulnerability)

   On **[H]** at any question: scan the project for evidence of existing tooling, draw on domain knowledge for the stack, propose a tool with reasoning and alternatives; developer confirms.

4. Draft `security-local-tooling_behaviour.md`:

   ```markdown
   ## Local security tooling — [stack]

   ### SAST
   - **Tool:** [tool or "none configured"]
   - **Runs:** [when]
   - **Blocking:** [threshold]

   ### Secrets scanning
   - **Tool:** [tool or "none configured"]
   - **Runs:** [when]
   - **Blocking:** [threshold]

   ### Dependency audit
   - **Tool:** [tool or "none configured"]
   - **Runs:** [when]
   - **Blocking:** [threshold]

   ## Agent checklist

   Before committing or raising a PR:
   - [ ] Has SAST been run? Are there findings at or above the blocking threshold?
   - [ ] Has secrets scanning been run? Are any secrets detected?
   - [ ] Has the dependency audit been run? Are there vulnerabilities at or above the blocking threshold?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft tooling configuration ready.
   > **[A]** Write (or extend if existing)   **[B]** Replace existing   **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/security-local-tooling_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-security-ci-cd` — configure pipeline security gates
> [2] `/tr-security-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/security-local-tooling_behaviour.md` — local scanner configuration and agent checklist.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-security-define`, skip the What's next block and return control to the orchestrator.
- Local tooling and CI/CD gates often mirror each other — local tools catch issues early; the pipeline enforces the same checks on every push.
