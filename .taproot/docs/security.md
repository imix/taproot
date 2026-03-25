# Security Posture

This document describes taproot's security model, applicable threat categories, and recommended controls. It is derived from `research/owasp-cli-and-agentic-applicability.md` and is the authoritative reference for security decisions.

---

## Trust Model

Taproot has two security boundaries that must be explicitly trusted:

**`settings.yaml` — Executable Configuration**
The `definitionOfDone` and `definitionOfReady` check entries are executed as shell commands via `spawnSync(..., { shell: true })` in `dod-runner.ts` / `dor-runner.ts`. This is an intentional design — equivalent to `package.json` scripts. The trust boundary is: whoever controls `.taproot/settings.yaml` controls what shell commands run during gate evaluation.

**`.taproot/skills/` — Agent Instructions**
Skill files (`.md`) are loaded and delivered as instructions to AI agents. Whoever controls skill content controls agent behaviour. A compromised skill file is a direct agent instruction injection vector.

Both boundaries are intentional; neither should be changed. Both must be consciously managed.

---

## OWASP Top 10 (2021) — Applicability

| Category | Verdict | Rationale |
|---|---|---|
| A01 Broken Access Control | Not applicable | No application-level access control; OS filesystem permissions are the control |
| A02 Cryptographic Failures | Not applicable | No passwords, tokens, or personal data stored or transmitted |
| **A03 Injection** | **Applicable** | `shell: true` in dod/dor-runner with `settings.yaml` commands; intentional trust model — document the boundary |
| **A04 Insecure Design** | **Applicable** | Trust model must be explicitly documented and threat-modelled |
| **A05 Security Misconfiguration** | **Applicable** | Shipped skill files must not contain insecure defaults; reviewed before publish |
| **A06 Vulnerable Components** | **Applicable** | npm dependencies may carry CVEs; controls: `npm audit` + lockfile + Syft + Grype in CI |
| A07 Authentication Failures | Not applicable | No authentication — local CLI tool with no user accounts or sessions |
| **A08 Integrity Failures** | **Applicable** | npm package integrity (provenance attestation); skill files as trusted instruction delivery |
| **A09 Logging Failures** | **Applicable (marginal)** | DoD/DoR error output must not reproduce raw command strings from `settings.yaml` |
| A10 SSRF | Not applicable | No HTTP requests made by taproot |

---

## Agentic Security Highlights

These categories are Critical for taproot as an agent instruction delivery system.

**LLM01 / ASI01 — Prompt Injection / Agent Goal Hijack**
Skill files are instructions agents execute without sanitisation. A compromised or malicious skill file is a direct prompt injection and agent goal hijack vector. Controls: human review of all skill changes; DoD skill review condition (see below).

**LLM03 / ASI04 — Supply Chain**
npm is the delivery vector for skill files. A compromised npm package delivers malicious agent instructions to every user. Controls: lockfile enforcement, provenance attestation, Syft SBOM + Grype vulnerability scan in CI.

**LLM05 / ASI05 — Improper Output Handling / Unexpected Code Execution**
Taproot output (skill files, adapters) is consumed by agents as trusted input. Skills that instruct agents to execute shell commands without validation are a direct RCE vector. Controls: no shell command execution in skills without explicit validation; least-privilege principle for all agent instructions.

**LLM06 — Excessive Agency**
Skills instruct agents to take consequential actions (commit, write files, invoke commands). Every skill must follow least-privilege: request only the permissions and actions genuinely required. Over-broad instructions create an excessive agency risk.

---

## Supply Chain Controls

Recommended controls for taproot's own CI and for projects using taproot:

- **`npm audit --audit-level=high`** — fail CI on high/critical CVEs in the dependency tree
- **Lockfile** — `package-lock.json` committed and verified; reject installs without a lockfile
- **Syft** — generate an SBOM (Software Bill of Materials) on every release build
- **Grype** — scan the SBOM for known vulnerabilities; fail on high/critical findings
- **npm provenance attestation** — publish with `--provenance` so package integrity can be verified against the build pipeline

---

## Skill Security Guidelines

All skill files (`.taproot/skills/*.md`, `skills/*.md`) must follow these rules:

1. **No shell execution without validation** — do not instruct agents to run shell commands unless the input is validated or the command is fully static
2. **No hardcoded credentials or tokens** — skill files are committed to version control and distributed via npm; credentials in skills are a public disclosure
3. **Least-privilege for agent instructions** — request only the permissions and actions the skill genuinely needs; avoid open-ended "do whatever is needed" patterns
4. **No sensitive data in output** — do not instruct agents to echo or log content from `settings.yaml` commands (raw command strings, exit output)

Every change to a skill file triggers the DoD skill review condition (see `.taproot/settings.yaml`).

---

## Non-Applicable Categories

| Category | Reason |
|---|---|
| A01 Broken Access Control | No application-level access control layer |
| A02 Cryptographic Failures | No secrets, credentials, or personal data in scope |
| A07 Authentication Failures | No user accounts or sessions |
| A10 SSRF | No outbound HTTP requests |
| LLM08 Vector/Embedding Weaknesses | No RAG or embedding systems |
| LLM10 Unbounded Consumption | No LLM inference; no resource consumption risk |
| ASI07 Insecure Inter-Agent Communication | Inter-agent orchestration is out of taproot's scope |

---

*See `research/owasp-cli-and-agentic-applicability.md` for the full applicability matrices and open questions.*
