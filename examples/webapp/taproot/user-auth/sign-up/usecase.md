# Behaviour: User Registration

## Actor
Visitor — an unauthenticated person who wants to create an account.

## Preconditions
- The visitor has access to the sign-up page
- The system can send transactional email

## Main Flow
1. Visitor enters email address and password
2. Visitor submits the registration form
3. System validates the email format and password strength
4. System checks the email is not already registered
5. System creates the account in an unverified state
6. System sends a verification email containing a one-time link
7. Visitor clicks the link in their email
8. System marks the account as verified and signs the visitor in
9. Visitor lands on the post-registration welcome page

## Alternate Flows

### Email already registered
- At step 4: system shows "An account with this email already exists" and offers a sign-in link

### Weak password
- At step 3: system shows password strength requirements and blocks form submission

### Verification link expired
- At step 8: system shows the link has expired and offers to resend a new one

## Postconditions
- A verified account exists for the visitor's email address
- The user is authenticated and has an active session
- A welcome email has been sent (if configured)

## Acceptance Criteria

**AC-1: Successful registration creates a verified account**
- Given a visitor with a valid email address and a strong password
- When they complete the registration form and click the verification link
- Then a verified account exists, the user is signed in, and they see the welcome page

**AC-2: Duplicate email is rejected**
- Given an email address that is already registered in the system
- When a visitor attempts to register with that email
- Then they see an error message and are offered a sign-in link

**AC-3: Weak password blocks submission**
- Given a visitor enters a password that does not meet strength requirements
- When they attempt to submit the form
- Then submission is blocked and the requirements are shown inline

**AC-4: Expired verification link is handled gracefully**
- Given a visitor clicks a verification link that has expired
- When the system processes the link
- Then they see an expiry message and a button to resend the verification email

## Status
- **State:** specified
- **Created:** 2026-03-25
