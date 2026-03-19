# Implementation: Password Policy

## Behaviour
../usecase.md

## Design Decisions
- Minimum 8 characters, at least one uppercase, one number
- Using zxcvbn for strength scoring

## Source Files
- `src/auth/password-policy.ts` — policy validation rules

## Commits
- `aaa1111` — Implement password policy validation

## Tests
- `test/auth/password-policy.test.ts` — tests all policy rules

## Status
- **State:** complete
- **Created:** 2024-01-21
- **Last verified:** 2024-03-01

## Notes
zxcvbn adds 400kb to bundle — lazy loaded.
