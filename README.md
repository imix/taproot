# Taproot

*Requirements as the root system of your codebase.*

Taproot is a folder-based requirement hierarchy stored alongside code. It gives every piece of code a traceable path back to a business intent — and every business intent a clear path to working, tested code.

```
taproot/
├── password-reset/                  ← Intent: why this exists
│   ├── intent.md
│   └── request-reset/               ← Behaviour: what it does
│       ├── usecase.md
│       └── email-trigger/           ← Implementation: how it's built
│           └── impl.md
```

## Why Taproot

AI-assisted coding generates code fast but loses track of *why* the code exists. Requirements drift, specs go stale, traceability disappears. Taproot solves the maintenance problem: how to keep a complete, current, navigable set of requirements synchronized with the actual codebase.

**Key properties:**

- **Filesystem is the data model.** No database, no external tool. Git-versioned alongside your code.
- **Scripts handle structure, AI handles semantics.** CLI validates format; AI skills create content and trace relationships.
- **Agent-agnostic.** Works with Claude Code, Cursor, GitHub Copilot, Windsurf, or any AI assistant that reads files.
- **Recursive nesting.** Behaviours can contain sub-behaviours. The tree grows as understanding deepens.

---

## Quick Start

```bash
npm install -g taproot

# Initialize in your project
taproot init --with-skills --agent claude

youragent
\> \/tr-ineed i want to build a webapp

or
\> \/tr-guide

# Validate the hierarchy
taproot validate-structure
taproot validate-format

# See what's built and what isn't
taproot coverage
```

---

## Installation

```bash
npm install -g taproot
```

Requires Node.js ≥ 18.

---

## Hierarchy

Three document types, three layers:

### Intent (`intent.md`)
The "why" and "for whom." Goal, stakeholders, success criteria, constraints.

```markdown
# Intent: Password Reset Without Support Contact

## Stakeholders
- Product: Jane — reduce support ticket volume
- Security: team — prevent account takeover

## Goal
Enable users to reset their password without contacting support,
while preventing unauthorized account access.

## Success Criteria
- [ ] Users can request a reset link via email
- [ ] Reset links expire after 15 minutes
- [ ] Failed attempts are rate-limited

## Status
- **State:** active
- **Created:** 2024-01-15
- **Last reviewed:** 2024-03-01
```

### Behaviour (`usecase.md`)
Observable system behaviour in UseCase format. Testable.

```markdown
# Behaviour: Request Password Reset

## Actor
Registered user who has forgotten their password

## Preconditions
- User account exists
- User is not currently logged in

## Main Flow
1. User navigates to the login page and clicks "Forgot password"
2. User enters their email address and submits
3. System validates the email exists in the database
4. System generates a time-limited reset token and sends an email
5. System displays "Check your email" confirmation

## Postconditions
- A reset token exists in the database, expiring in 15 minutes
- A reset email has been sent to the provided address

## Error Conditions
- Email not found: Show generic "if this email exists..." message (prevent enumeration)
- Rate limit exceeded: Return 429, show "Too many requests" message

## Status
- **State:** implemented
```

### Implementation (`impl.md`)
Links behaviour to code. The traceability bridge.

```markdown
# Implementation: Email Trigger

## Behaviour
../usecase.md

## Design Decisions
- Generic error message regardless of email existence (prevent user enumeration)
- Rate limit: 3 requests per email per hour via Redis

## Source Files
- `src/auth/password-reset.ts` — request handler and token generation
- `src/auth/password-reset-email.ts` — email template and delivery

## Commits
- `a1b2c3d` — Add password reset request endpoint
- `e4f5g6h` — Add rate limiting to reset requests

## Tests
- `test/auth/password-reset.test.ts` — covers main flow, rate limiting, email enumeration

## Status
- **State:** complete
- **Created:** 2024-02-01
- **Last verified:** 2024-03-01
```

---

## CLI Commands

### Validation

```bash
taproot validate-structure [--path taproot/] [--strict]
```
Verify folder hierarchy follows nesting rules. Exit 0 if valid, exit 1 with violations.

```bash
taproot validate-format [--path taproot/] [--fix]
```
Validate that marker files conform to their schemas. `--fix` adds missing section headers.

### Traceability

```bash
taproot link-commits [--since <date|hash>] [--dry-run]
```
Scan git log for `taproot(<path>): message` commits and link them to `impl.md` records.

```bash
taproot check-orphans [--include-unimplemented]
```
Find broken references: missing source files, invalid behaviour refs, commits not in git history.

### Reporting

```bash
taproot coverage [--format tree|json|markdown|context]
```
Completeness summary. `--format context` writes `taproot/CONTEXT.md` for agent consumption.

```bash
taproot sync-check [--since <date>]
```
Detect staleness: source files modified after `impl.md`, usecase updated after implementations.

### Setup

```bash
taproot init [--with-hooks] [--with-ci github|gitlab] [--with-skills] [--agent claude|cursor|copilot|windsurf|generic|all]
```

| Option | Effect |
|--------|--------|
| `--with-hooks` | Installs git pre-commit hook running `validate-structure` and `validate-format` |
| `--with-ci github` | Generates `.github/workflows/taproot.yml` |
| `--with-ci gitlab` | Generates `.gitlab-ci.yml` taproot validation job |
| `--with-skills` | Copies canonical skill definitions to `taproot/skills/` |
| `--agent <name>` | Generates agent adapter (see Agent Setup below) |

---

## Agent Setup

Taproot works with any AI coding assistant. Run `taproot init --agent <name>` to generate the appropriate adapter:

| Agent | Command | Output |
|-------|---------|--------|
| Claude Code | `taproot init --agent claude` | `.claude/skills/taproot/*.md` |
| Cursor | `taproot init --agent cursor` | `.cursor/rules/taproot.md` |
| GitHub Copilot | `taproot init --agent copilot` | `.github/copilot-instructions.md` |
| Windsurf | `taproot init --agent windsurf` | `.windsurfrules` |
| Any agent | `taproot init --agent generic` | `AGENTS.md` |
| All agents | `taproot init --agent all` | All of the above |

### Claude Code Skills

After `taproot init --agent claude`, skills are available as slash commands:

```
/taproot:brainstorm   Explore ideas before committing to an intent
/taproot:intent       Create or refine a business intent
/taproot:behaviour    Define a UseCase under an intent
/taproot:implement    Implement a behaviour with full traceability
/taproot:grill        Stress-test any artifact
/taproot:grill-all    Comprehensive review of a subtree
/taproot:trace        Navigate: file → impl → behaviour → intent
/taproot:status       Coverage dashboard with actionable suggestions
/taproot:refine       Update a spec from implementation learnings
/taproot:promote      Escalate findings to the intent level
/taproot:decompose    Break an intent into behaviours
```

---

## Commit Convention

Link commits to implementations using conventional tags:

```
taproot(<intent>/<behaviour>/<impl>): <message>
```

Example:
```
taproot(password-reset/request-reset/email-trigger): add rate limiting
```

Or use a commit trailer:
```
fix: handle missing user gracefully

Taproot: password-reset/request-reset/email-trigger
```

Then run `taproot link-commits` to update `impl.md` automatically.

---

## Typical Workflows

### New feature (top-down)

```bash
# 1. Define the intent
/taproot:intent "Users need to reset their password without contacting support"

# 2. Stress-test it
/taproot:grill taproot/password-reset/intent.md

# 3. Break it into behaviours
/taproot:decompose taproot/password-reset/

# 4. Implement each behaviour
/taproot:implement taproot/password-reset/request-reset/

# 5. Check progress
taproot coverage --path taproot/password-reset/
```

### Bug fix (bottom-up)

```bash
# Find what spec this code belongs to
/taproot:trace src/auth/password-reset.ts

# Update the spec to capture the bug scenario
/taproot:refine taproot/password-reset/request-reset/ "missing rate limit allows spam"

# Implement the fix
/taproot:implement taproot/password-reset/request-reset/
```

### Health check

```bash
/taproot:status
# or
taproot coverage && taproot check-orphans && taproot sync-check
```

### Onboard existing codebase

```bash
# Find unlinked source files
/taproot:trace --unlinked

# Create intents and behaviours for them
/taproot:intent "Capture existing auth system"
/taproot:behaviour taproot/auth/ "login flow"
```

---

## Configuration (`.taproot.yaml`)

```yaml
version: 1
root: taproot/

# Commit message format for linking
commit_pattern: "taproot\\(([^)]+)\\):"
commit_trailer: "Taproot"

# Agent adapters to generate
agents: [claude, cursor, generic]

# Validation strictness
validation:
  require_dates: true
  require_status: true
  allowed_intent_states: [draft, active, achieved, deprecated]
  allowed_behaviour_states: [proposed, specified, implemented, tested, deprecated]
  allowed_impl_states: [planned, in-progress, complete, needs-rework]
```

---

## CI Integration

### GitHub Actions

```bash
taproot init --with-ci github
```

Generates `.github/workflows/taproot.yml` that runs on every PR:
- `taproot validate-structure`
- `taproot validate-format`
- `taproot check-orphans`

### GitLab CI

```bash
taproot init --with-ci gitlab
```

Generates a `taproot-validate` job in `.gitlab-ci.yml`.

### On merge: keep CONTEXT.md current

Add to your merge/post-merge pipeline:
```bash
taproot link-commits
taproot coverage --format context   # updates taproot/CONTEXT.md
```

---

## Design Principles

1. **Folder hierarchy IS the data model.** No database. Git-versioned.
2. **Scripts handle structure, AI handles semantics.** CLI validates; AI creates and traces.
3. **Every piece of code traces back to an intent.** Bottom-up and top-down navigation.
4. **Recursive nesting.** Sub-behaviours, sub-intents — the tree grows naturally.
5. **Agent-agnostic by design.** Skills are portable markdown, not IDE plugins.

---

## License

MIT
