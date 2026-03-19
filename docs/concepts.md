# Document Types

Three layers, three document types.

## Intent (`intent.md`)

The "why" and "for whom." Goal, stakeholders, success criteria, constraints.

```markdown
# Intent: Password Reset Without Support Contact

## Goal
Enable users to reset their password without contacting support,
while preventing unauthorized account access.

## Stakeholders
- Product: Jane — reduce support ticket volume
- Security: team — prevent account takeover

## Success Criteria
- [ ] Users can request a reset link via email
- [ ] Reset links expire after 15 minutes
- [ ] Failed attempts are rate-limited

## Status
- **State:** active
- **Created:** 2024-01-15
```

## Behaviour (`usecase.md`)

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
- Email not found: show generic message (prevent enumeration)
- Rate limit exceeded: return 429

## Status
- **State:** implemented
```

## Implementation (`impl.md`)

Links behaviour to code. The traceability bridge.

```markdown
# Implementation: Email Trigger

## Behaviour
../usecase.md

## Design Decisions
- Generic error message regardless of email existence (prevent enumeration)
- Rate limit: 3 requests per email per hour via Redis

## Source Files
- `src/auth/password-reset.ts`
- `src/auth/password-reset-email.ts`

## Commits
- `a1b2c3d` — Add password reset request endpoint

## Tests
- `test/auth/password-reset.test.ts`

## Status
- **State:** complete
- **Created:** 2024-02-01
- **Last verified:** 2024-03-01
```

## Nesting

Behaviours can contain sub-behaviours. The tree grows as understanding deepens. Implementations are always leaves.
