# Intent: Taproot Security Baseline

## Stakeholders
- **Taproot maintainer**: shipping a CLI tool used in developer workflows — needs confidence that releases don't introduce vulnerabilities or supply chain risks that could compromise adopters' environments
- **Taproot adopter**: developer or team installing taproot — needs assurance that the tool they're running locally is safe, does not execute untrusted code, and does not expose their project to supply chain or injection risks
- **Security-conscious organisation**: evaluating taproot for adoption — needs a clear, documented security posture to satisfy internal review

## Goal
Ensure taproot meets baseline security requirements applicable to a CLI tool by evaluating all OWASP Top 10 categories for relevance, implementing verifiable controls for those that apply, and explicitly documenting reasoning for those that do not — so that maintainers can ship with confidence and adopters can install without risk.

## Success Criteria
- [ ] All OWASP Top 10 categories are evaluated for applicability to taproot as a CLI tool — each category is either addressed with a verifiable control or documented as not applicable with explicit reasoning
- [ ] Applicable OWASP controls are wired into the Definition of Done as `check-if-affected-by: taproot-security/<behaviour>` entries — every implementation commit is automatically evaluated for compliance
- [ ] Dependency supply chain risk (OWASP A06) is mitigated: known CVEs in taproot's npm dependencies are detected and blocked before release
- [ ] Taproot's security hierarchy serves as a reference example of how to model and enforce security requirements within a taproot project

## Constraints
- Penetration testing and manual security audits are out of scope — only automated or agent-verifiable controls are in scope
- Security of projects *built with* taproot is out of scope — only taproot itself is covered
- Taproot is a CLI tool with no web surface, no user authentication, and no persistent network services — OWASP categories requiring these (e.g. A07 Authentication Failures, A01 Broken Access Control in a web context) are documented as not applicable rather than implemented

## Behaviours <!-- taproot-managed -->

## Status
- **State:** draft
- **Created:** 2026-03-24
- **Last reviewed:** 2026-03-24

## Notes
Taproot's primary attack surfaces as a CLI tool:
- **Supply chain** (A06): npm dependencies may carry known CVEs
- **Injection** (A03): taproot reads `settings.yaml`, executes git hooks, and installs skill files — malformed or malicious input could trigger command injection
- **Security misconfiguration** (A05): default settings and shipped skill files should not introduce insecure defaults
- **Vulnerable components** (A06): bundled skills and language packs are first-party content, but must be reviewed
