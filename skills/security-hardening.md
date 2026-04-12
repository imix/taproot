# Skill: security-hardening

## Description

Elicit and capture the deploy-time security baseline for the project — security headers, TLS requirements, least-privilege, secrets management approach, and platform-specific hardening. Writes `security-hardening_behaviour.md` to `taproot/global-truths/`.

## Inputs

- `platform` (optional): Deployment platform (e.g. `docker`, `k8s`, `lambda`, `heroku`, `vps`). If omitted, read from `security-context_intent.md` or detect.

## Steps

1. Read `taproot/global-truths/security-context_intent.md` if it exists to load deployment environment and platform.
   Read `taproot/global-truths/security-hardening_behaviour.md` if it exists and note current baseline.

2. Scan the project for existing hardening configuration:
   - Web server config (nginx, Apache, Caddy) for header settings
   - Dockerfile or `docker-compose.yml` for user, capability, and read-only flags
   - Kubernetes manifests for security context, RBAC, network policies
   - Cloud config (Terraform, CDK, SAM) for IAM roles and policies
   - `.env.example` or config files for secrets management approach
   - TLS config (certificate handling, minimum version settings)

   Report what was found. Filter out categories not applicable to the deployment environment (e.g. skip security headers for a CLI tool).

3. Present hardening categories applicable to the deployment. Offer **[?] Get help** at each:

   > **Security headers** *(web surfaces only)*
   >
   > - Content-Security-Policy: [proposed default for stack]
   > - HSTS: enabled with max-age? (recommended: `max-age=63072000; includeSubDomains`)
   > - X-Frame-Options / X-Content-Type-Options / Referrer-Policy?
   >
   > Confirm, adjust, or skip.   **[?]** Get help

   > **TLS requirements** *(network-exposed services only)*
   >
   > - Minimum TLS version? (recommended: TLS 1.2; preferred: TLS 1.3 only)
   > - Self-signed certs allowed in any environment? (recommended: no, not even staging)
   >
   > Confirm, adjust, or skip.   **[?]** Get help

   > **Least-privilege**
   >
   > - Do containers/processes run as non-root? (recommended: yes)
   > - Are IAM roles/service accounts scoped to minimum required permissions?
   > - Are file system permissions restricted where applicable?
   >
   > Confirm, adjust, or skip.   **[?]** Get help

   > **Secrets management**
   >
   > - How are secrets provided at runtime? (env vars, vault, AWS Secrets Manager, K8s secrets)
   > - Are secrets ever written to disk, logs, or version control?
   > - What is the process when a secret needs rotation?
   >
   > Confirm, adjust, or skip.   **[?]** Get help

   > **Platform-specific** *(if applicable)*
   >
   > Any additional hardening for [platform]? (e.g. container capabilities dropped, network policies, read-only root filesystem)
   >
   > Confirm, adjust, or skip.   **[?]** Get help

   On **[?]**: scan config files for evidence, draw on domain knowledge for the platform, propose baseline with reasoning; developer confirms.

4. Draft `security-hardening_behaviour.md`:

   ```markdown
   ## Deployment hardening baseline — [platform]

   ### Security headers
   [Configured headers or "not applicable"]

   ### TLS requirements
   [Minimum version and cert policy]

   ### Least-privilege
   [Container/process user, IAM scope, file permissions]

   ### Secrets management
   [Runtime secrets approach and rotation process]

   ### Platform-specific
   [Platform hardening or "none configured"]

   ## Agent checklist

   Before deploying or reviewing deployment configuration:
   - [ ] Are all required security headers present and correctly configured?
   - [ ] Is TLS at or above the minimum version? Are self-signed certs absent outside approved environments?
   - [ ] Do containers/processes run as non-root with minimum required permissions?
   - [ ] Are secrets loaded from the designated store — not from disk, logs, or version control?
   - [ ] Are platform-specific hardening requirements met?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft hardening baseline ready.
   > **[A]** Write (or extend if existing)   **[B]** Replace existing   **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/security-hardening_behaviour.md`. Report path written.

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-security-periodic-review` — configure the periodic review checklist
> [2] `/tr-security-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/security-hardening_behaviour.md` — deployment hardening baseline and agent checklist.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-security-define`, skip the What's next block and return control to the orchestrator.
- Categories not applicable to the deployment environment (e.g. security headers for a CLI tool) should be recorded as "not applicable" in the truth file to prevent re-asking.
