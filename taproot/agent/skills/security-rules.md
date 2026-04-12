# Skill: security-rules

## Description

Elicit and capture secure coding conventions for the project across 9 rule categories. Writes `security-rules_behaviour.md` to `taproot/global-truths/` with conventions and an agent checklist.

## Inputs

- `stack` (optional): Language and framework. If omitted, read from `security-context_intent.md` or ask.

## Steps

1. Read `taproot/global-truths/security-context_intent.md` if it exists to load stack and threat profile.
   Read `taproot/global-truths/security-rules_behaviour.md` if it exists and note current conventions.

2. Scan the codebase for existing security patterns:
   - Input validation: schema libraries, sanitisation calls, allowlist/denylist patterns
   - Authentication: token handling, session management, middleware
   - Authorisation: permission checks, role guards, access control patterns
   - Secrets: env var usage, config loading, any hardcoded values
   - Injection: ORM usage, parameterised queries, template escaping
   - Error handling: error response shapes, logging of exceptions
   - Logging: what gets logged (requests, errors, audit events)

   Report what was found with file references.

3. Ask targeted questions. Propose stack-appropriate defaults where context is available. Each question offers **[?] Get help**:

   > **Secure coding conventions — [stack]**
   >
   > Answer each that applies; skip any that don't:
   >
   > - **Input validation:** How is untrusted input validated before use? (schema library, manual checks, allowlist) What happens when validation fails?
   > - **Authentication:** What mechanism is used? (JWT, session cookie, API key, OAuth) Where are tokens stored and how are they rotated?
   > - **Authorisation:** Where are access control checks placed? (middleware, per-handler, decorator) What is the default deny behaviour?
   > - **Secrets handling:** Where do credentials and API keys live? (env vars, vault, secrets manager) Are there any hardcoded values to eliminate?
   > - **Data protection:** Is PII or sensitive data stored/transmitted? What encryption is used at rest and in transit?
   > - **Error handling:** What should error messages reveal to callers? How are stack traces and internal errors surfaced vs suppressed?
   > - **Logging:** What must always be logged? (auth events, access denied, mutations) What must never be logged? (tokens, passwords, PII)
   > - **Injection prevention:** How are database queries constructed? (ORM, parameterised, raw SQL) How is user input used in commands, templates, or file paths?
   > - **Dependency hygiene:** How are dependencies pinned? Is there a process for reviewing new dependencies before adding them?

   On **[?]** at any question: scan the codebase for evidence, apply domain knowledge for the stack, present a draft convention with reasoning and one or two alternatives; developer confirms or adjusts.

4. Draft `security-rules_behaviour.md`:

   ```markdown
   ## Secure coding rules — [stack]

   ### Input validation
   [Convention]

   ### Authentication
   [Convention]

   ### Authorisation
   [Convention]

   ### Secrets handling
   [Convention]

   ### Data protection
   [Convention]

   ### Error handling
   [Convention]

   ### Logging
   [Convention]

   ### Injection prevention
   [Convention]

   ### Dependency hygiene
   [Convention]

   ## Agent checklist

   Before implementing any feature that handles user input, authentication, data, or external calls:
   - [ ] Is all untrusted input validated at the boundary before use?
   - [ ] Are authentication tokens stored and transmitted according to convention?
   - [ ] Are access control checks in place before any privileged operation?
   - [ ] Are secrets loaded from env vars or the designated secrets store — not hardcoded?
   - [ ] Is sensitive data encrypted at rest and in transit per convention?
   - [ ] Do error responses follow the convention — no stack traces or internal details exposed?
   - [ ] Are auth events, access denials, and mutations logged? Are tokens and PII absent from logs?
   - [ ] Are all database queries parameterised or ORM-mediated? Is user input escaped in templates and commands?
   - [ ] Are new dependencies reviewed and pinned before use?
   ```

5. Present for confirmation:

   > **[artifact-review]** Draft conventions ready.
   > **[A]** Write (or extend if existing)   **[B]** Replace existing   **[C]** Cancel

6. On **[A]**: write or append `taproot/global-truths/security-rules_behaviour.md`. Report: "✓ Written: `taproot/global-truths/security-rules_behaviour.md`"

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

> **What's next?**
> [1] `/tr-security-local-tooling` — configure local security scanners
> [2] `/tr-security-define` — return to module orchestrator
> [3] `/tr-commit` — commit the new truth file

## Output

`taproot/global-truths/security-rules_behaviour.md` — secure coding conventions and agent checklist.

## CLI Dependencies

None.

## Notes

- If invoked from `/tr-security-define`, skip the What's next block and return control to the orchestrator.
- Generic defaults apply when no stack context is available — developer should confirm each convention even if the proposal seems obvious.
- Rule categories are stable across tech stacks; only the specific tools, libraries, and patterns mentioned in each convention change.
