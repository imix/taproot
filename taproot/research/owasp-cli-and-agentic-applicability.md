# Research: OWASP Applicability to Taproot (Node.js CLI + Agentic Tool)

**Topic:** Which OWASP Top 10 categories (2021), OWASP LLM Top 10 (2025), and OWASP Agentic Top 10 (2026) apply to taproot — a Node.js CLI tool that also serves as an agentic instruction delivery system.

**Researched:** 2026-03-24
**Context:** Input for `taproot/taproot-security/` behaviour specs.

---

## Local sources

- `docs/architecture.md` — confirms `shell: true` in `dod-runner.ts` / `dor-runner.ts`; git commands use safe array args throughout; I/O only at command boundaries
- `src/core/dod-runner.ts` / `src/core/dor-runner.ts` — `spawnSync(..., { shell: true })` with commands sourced from `settings.yaml`; intentional trust model (user-defined DoD/DoR checks)
- `src/core/git.ts` — `spawnSync('git', args, ...)` array args throughout; no shell interpolation

---

## Web sources

- OWASP Top 10 2021 (owasp.org/Top10/) — canonical web-app list; A03/A06/A08 applicable to CLI context
- OWASP Desktop App Security Top 10 (owasp.org/www-project-desktop-app-security-top-10/) — injection, privilege escalation, data exposure for local applications
- OWASP LLM Top 10 2025 (genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/) — LLM01/LLM05/LLM06 critical for taproot as instruction delivery system
- OWASP Agentic Top 10 2026 (genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) — ASI01/ASI04/ASI05 critical
- Node.js Security Best Practices (nodejs.org/en/learn/getting-started/security-best-practices) — spawn vs exec, Node.js --permission model
- OWASP NPM Security Cheat Sheet (cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html) — lockfile, ignore-scripts, audit-ci integration
- Snyk: Secure Node.js from Supply Chain Attacks (snyk.io/blog/npm-security-preventing-supply-chain-attacks/) — Syft, Grype, provenance attestation

---

## Expert insights

- `shell: true` in dod/dor-runner is acceptable — it is an intentional trust model equivalent to `package.json` scripts. Document it prominently; do not change the design.
- Injection surface is complete: git/file I/O are safe; `shell: true` is limited to `settings.yaml`-sourced commands only.
- Syft + Grype are the preferred supply chain scanning tools (over npm audit alone).
- Agentic OWASP risks (LLM + ASI) warrant a dedicated behaviour, separate from the general OWASP Top 10 behaviour — the threat model is distinct.
- Skill file security review should be automated via `check-if-affected-by: taproot-security/skill-security-review` as a DoD condition — every skill change is auto-reviewed.
- Raw command strings from `settings.yaml` must never appear in error output — show condition name and exit code only (LLM02 / sensitive data exposure).

---

## OWASP Top 10 (2021) — Applicability matrix

| Category | Verdict | Rationale |
|---|---|---|
| **A01 Broken Access Control** | Not applicable | No application-level access control; OS filesystem permissions are the control |
| **A02 Cryptographic Failures** | Not applicable | No passwords, tokens, or personal data stored or transmitted |
| **A03 Injection** | **Applicable** | `shell: true` in dod/dor-runner with `settings.yaml` commands; intentional trust model — document the boundary |
| **A04 Insecure Design** | **Applicable** | Trust model (`.taproot/settings.yaml` = executable config) must be explicitly documented and threat-modelled |
| **A05 Security Misconfiguration** | **Applicable** | Shipped skill files must not contain insecure defaults; reviewed before publish |
| **A06 Vulnerable Components** | **Applicable** | npm dependencies may carry CVEs; controls: `npm audit` + lockfile + Syft + Grype in CI |
| **A07 Authentication Failures** | Not applicable | No authentication — local CLI tool with no user accounts or sessions |
| **A08 Integrity Failures** | **Applicable** | npm package integrity (provenance attestation); skill files as trusted instruction delivery |
| **A09 Logging Failures** | **Applicable (marginal)** | DoD/DoR error output must not reproduce raw command strings from `settings.yaml` |
| **A10 SSRF** | Not applicable | No HTTP requests made by taproot |

---

## OWASP LLM Top 10 (2025) — Applicability matrix

| Category | Verdict | Rationale |
|---|---|---|
| **LLM01 Prompt Injection** | **Critical** | Skill files are instructions agents follow; compromised or malicious skill file = direct agent instruction injection |
| **LLM02 Sensitive Information Disclosure** | **Applicable** | DoD/DoR command strings in `settings.yaml` could contain secrets; must not be logged |
| **LLM03 Supply Chain** | **Critical** | npm distribution is the delivery vector for skill files; compromised package = malicious agent instructions |
| **LLM04 Data and Model Poisoning** | Low | Taproot does not train or fine-tune models; skill file content corruption is a minor variant |
| **LLM05 Improper Output Handling** | **Critical** | Taproot output (skill files, adapters) is trusted and executed by agents without sanitisation |
| **LLM06 Excessive Agency** | **High** | Skills instruct agents to take actions (commit, write files, run commands); must follow least-privilege principle |
| **LLM07 System Prompt Leakage** | Medium | Internal rules baked into skill files could be extracted; less direct risk |
| **LLM08 Vector/Embedding Weaknesses** | Not applicable | Taproot does not use RAG or embedding systems |
| **LLM09 Misinformation** | Low | Agents could over-trust flawed skill files; mitigated by spec review process |
| **LLM10 Unbounded Consumption** | Not applicable | No LLM inference; no resource consumption risk |

---

## OWASP Agentic Top 10 (2026) — Applicability matrix

| Category | Verdict | Rationale |
|---|---|---|
| **ASI01 Agent Goal Hijack** | **Critical** | Compromised skill files redirect agent behaviour; agents treat taproot output as trusted instructions |
| **ASI02 Tool Misuse** | **Critical** | Taproot is a tool agents invoke; ambiguous or over-privileged skills cause misuse |
| **ASI03 Identity and Privilege Abuse** | Medium | If skills instruct agents to cache or relay credentials, escalation risk |
| **ASI04 Agentic Supply Chain** | **Critical** | npm compromise → malicious skills → agent instruction injection; primary delivery vector |
| **ASI05 Unexpected Code Execution** | **Critical** | Skills that instruct agents to run shell commands without validation = direct RCE vector |
| **ASI06 Memory and Context Poisoning** | High | Cached skill files persist; one-time compromise affects all future agent sessions |
| **ASI07 Insecure Inter-Agent Communication** | Medium | Depends on agent orchestration layer; taproot itself does not handle inter-agent comms |
| **ASI08 Cascading Failures** | High | Poisoned skill → downstream agents receive and propagate corrupted instructions |
| **ASI09 Human-Agent Trust Exploitation** | Medium | Agents presenting taproot output as authoritative may mislead users |
| **ASI10 Rogue Agents** | High | Compromised agent + malicious taproot output = rogue agent executing attacker-controlled instructions |

---

## Key conclusions

1. **Taproot has two distinct security surfaces** — as a CLI tool (standard OWASP Top 10) and as an agentic instruction delivery system (LLM + ASI Top 10). These require two separate behaviour specs.

2. **Applicable standard OWASP categories:** A03 (injection — document trust model), A04 (insecure design — threat model), A05 (misconfiguration — skill defaults), A06 (supply chain — Syft + Grype + audit + provenance), A08 (integrity — npm publish controls + skill review), A09 (logging — scrub command strings).

3. **Critical agentic categories:** LLM01+ASI01 (prompt injection / goal hijack via skill files), LLM03+ASI04 (supply chain), LLM05+ASI05 (output handling / RCE), LLM06 (excessive agency in skills), ASI06+ASI08 (memory poisoning + cascading failures).

4. **Recommended controls:**
   - Supply chain: `npm audit` + lockfile + Syft (SBOM) + Grype (vuln scan) + npm provenance attestation
   - Skill integrity: human review + `check-if-affected-by: taproot-security/skill-security-review` DoD condition
   - Trust model documentation: `.taproot/settings.yaml` = executable config; `.taproot/skills/` = agent instructions
   - Logging: DoD/DoR errors show condition name + exit code only; no raw command strings

5. **Not applicable:** A01, A02, A07, A10 (no access control surface, no crypto, no auth, no HTTP); LLM08, LLM10, ASI07 (no RAG, no inference, inter-agent comms are out of scope).

---

## Open questions

- Should taproot implement runtime integrity checking on skill files at load time (hash verification against a manifest shipped with the npm package)?
- Should the Node.js `--permission` flag be recommended in taproot's own CI to restrict filesystem scope during test runs?
- Should the `taproot-security` intent include a behaviour for the release security checklist (SBOM generation, provenance, Grype scan) or is that covered by the supply chain behaviour?

---

## References

- OWASP Top 10 2021: https://owasp.org/Top10/
- OWASP Desktop App Security Top 10: https://owasp.org/www-project-desktop-app-security-top-10/
- OWASP LLM Top 10 2025: https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/
- OWASP Agentic Top 10 2026: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- OWASP NPM Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html
- Node.js Security Best Practices: https://nodejs.org/en/learn/getting-started/security-best-practices
- Snyk: Secure Node.js from Supply Chain Attacks: https://snyk.io/blog/npm-security-preventing-supply-chain-attacks/
- OWASP Dependency-Check: https://owasp.org/www-project-dependency-check/
