# Behaviour: User Login

## Actor
Registered user — a person with an existing verified account.

## Preconditions
- The user has a verified account
- The user has access to the sign-in page

## Main Flow
1. User enters their email address and password
2. User submits the sign-in form
3. System looks up the account by email
4. System verifies the password against the stored hash
5. System creates an authenticated session
6. User is redirected to their dashboard (or the page they originally requested)

## Alternate Flows

### Incorrect credentials
- At step 4: system shows "Incorrect email or password" without revealing which field is wrong
- Failed attempt is counted against the rate limit for that IP and account

### Account locked
- Before step 3: if the account has exceeded the failed-attempt threshold, system shows a lockout message with an unlock link sent to the account email

### Unverified account
- At step 3: system detects the account is unverified and prompts the user to check their email or resend the verification link

### Remember me
- User can opt into a long-lived session (e.g. 30 days) via a "Keep me signed in" checkbox

## Postconditions
- The user has an active authenticated session
- The sign-in event is recorded in the audit log
- The user is on their dashboard or the originally requested page

## Acceptance Criteria

**AC-1: Valid credentials produce an authenticated session**
- Given a registered user with correct email and password
- When they submit the sign-in form
- Then they are signed in and redirected to their dashboard

**AC-2: Invalid credentials are rejected without disclosure**
- Given a user who enters an incorrect password
- When they submit the sign-in form
- Then they see "Incorrect email or password" (not which field is wrong) and the attempt is counted

**AC-3: Account is locked after repeated failures**
- Given a user who has exceeded the failed-attempt threshold
- When they attempt to sign in again
- Then they see a lockout message and receive an unlock email

**AC-4: Unverified accounts are redirected to verification**
- Given a user whose account email has not been verified
- When they attempt to sign in with correct credentials
- Then they are prompted to verify their email before accessing the app

## Status
- **State:** specified
- **Created:** 2026-03-25
