# Implementation: Email Validation

## Behaviour
../usecase.md

## Design Decisions
- Using regex validation on the client, plus MX record check on server
- Chose not to use a third-party email validation API to avoid external dependency

## Source Files
- `src/auth/email-validator.ts` — client-side email format validation
- `src/auth/email-validator.server.ts` — server-side MX record check

## Commits
- `abc1234` — Add email validation on registration form
- `def5678` — Add server-side MX record verification

## Tests
- `test/auth/email-validator.test.ts` — tests format validation and MX check

## Status
- **State:** complete
- **Created:** 2024-01-20
- **Last verified:** 2024-03-01

## Notes
MX check adds ~200ms to registration — acceptable per product decision.
