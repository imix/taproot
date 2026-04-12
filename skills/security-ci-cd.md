# Skill: security-ci-cd

## Description

Elicit and configure which security gates run in the CI/CD pipeline — which tools, which trigger, and whether findings block the pipeline or warn only. Writes `security-ci-cd_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `ci` (optional): CI system name (e.g. `github-actions`, `gitlab-ci`, `jenkins`). If omitted, read from `security-context_intent.md` or detect from project.

## Steps

1. Read `taproot/global-truths/security-context_intent.md` if it exists to load deployment and stack.
   Read `taproot/global-truths/security-ci-cd_behaviour.md` if it exists and note current gates.

2. Scan for existing CI configuration:
   - `.github/workflows/` — GitHub Actions
   - `.gitlab-ci.yml` — GitLab CI
   - `Jenkinsfile`, `azure-pipelines.yml`, `circle.ci/config.yml`, etc.

   Report detected CI system and any existing security steps found.

   If no CI config is detected: ask the developer to name their CI system or confirm there is none. If none: note the layer cannot be configured and return.

3. Present gate categories. For each, filter out categories not applicable to the deployment environment (e.g. skip container scanning for CLI tools with no Docker). Offer **[?] Get help** at each:

   > **SAST in pipeline**
   >
   > - Tool/step? (reuse local SAST tool, or a dedicated pipeline action)   **[?]** Get help
   > - Trigger? (on PR / on push to main / both)
   > - Blocking? (yes — fails pipeline / no — warning only)

   > **Secrets scanning in pipeline**
   >
   > - Tool/step?   **[?]** Get help
   > - Trigger? (on PR / on every push)
   > - Blocking?

   > **Dependency vulnerability check**
   >
   > - Tool/step?   **[?]** Get help
   > - Trigger? (on PR / scheduled / both)
   > - Blocking? (critical CVEs only / high+critical / any)

   > **Container/image scanning** *(skip if no container build)*
   >
   > - Tool/step? (trivy, grype, Snyk container)   **[?]** Get help
   > - Trigger? (on image build / before deploy)
   > - Blocking?

   > **DAST** *(skip if no deployed web surface)*
   >
   > - Tool/step? (OWASP ZAP, Burp Suite CI)   **[?]** Get help
   > - Trigger? (on deploy to staging / scheduled)
   > - Blocking?

   On **[?]**: scan CI config for evidence, propose a gate with reasoning and alternatives; developer confirms.

4. Draft `security-ci-cd_behaviour.md`:

   ```markdown
   ## CI/CD security gates — [CI system]

   ### SAST
   - **Tool:** [tool or "not configured"]
   - **Trigger:** [when]
   - **Blocking:** [yes/no — threshold]

   ### Secrets scanning
   - **Tool:** [tool or "not configured"]
   - **Trigger:** [when]
   - **Blocking:** [yes/no]

   ### Dependency vulnerability check
   - **Tool:** [tool or "not configured"]
   - **Trigger:** [when]
   - **Blocking:** [yes/no — threshold]

   ### Container scanning
   - **Tool:** [tool or "not applicable"]
   - **Trigger:** [when]
   - **Blocking:** [yes/no]

   ### DAST
   - **Tool:** [tool or "not applicable"]
   - **Trigger:** [when]
   - **Blocking:** [yes/no]

   ## Agent checklist

   When adding or modifying CI/CD configuration:
   - [ ] Are all configured security gates present and correctly triggered?
   - [ ] Do blocking gates fail the pipeline on findings at or above the configured threshold?
   - [ ] Are warning-only gates reporting to the PR or merge summary?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft pipeline gates ready.
   > **[A]** Write (or extend if existing)   **[B]** Replace existing   **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/security-ci-cd_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-security-hardening` — define deployment hardening baseline
> [2] `/tr-security-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/security-ci-cd_behaviour.md` — pipeline gate configuration and agent checklist.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-security-define`, skip the What's next block and return control to the orchestrator.
- Gates that are "not applicable" (e.g. container scanning for a CLI tool) should still be recorded as "not applicable" in the truth file — this makes the decision explicit and prevents re-asking on future invocations.
