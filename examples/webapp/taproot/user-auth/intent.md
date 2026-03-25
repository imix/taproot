# Intent: User Authentication

## Goal
Allow users to identify themselves to the application so that access to protected resources can be controlled.

## Stakeholders
- **Registered user**: needs a reliable, secure way to access their account from any device
- **Visitor**: needs a frictionless path from landing on the site to having a working account
- **Security / compliance**: needs authentication events logged and brute-force attacks mitigated

## Success Criteria
- A visitor can create a verified account using email and password within 2 minutes
- A registered user can sign in and reach their dashboard in under 30 seconds
- Failed login attempts are rate-limited and suspicious activity is logged
- Forgotten passwords can be recovered without contacting support

## Behaviours <!-- taproot-managed -->
- [User Registration](./sign-up/usecase.md)
- [User Login](./login/usecase.md)
- [Password Reset](./password-reset/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-25
