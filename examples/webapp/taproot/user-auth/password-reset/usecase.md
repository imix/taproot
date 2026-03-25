# Behaviour: Password Reset

## Actor
Registered user — a person who has forgotten their password and cannot sign in.

## Preconditions
- An account exists for the user's email address
- The system can send transactional email

## Main Flow
1. User navigates to "Forgot password" from the sign-in page
2. User enters their email address and submits
3. System locates the account and generates a short-lived reset token
4. System sends a reset email containing a one-time link (valid for 1 hour)
5. User clicks the link in their email
6. System validates the token is unused and unexpired
7. User enters and confirms a new password
8. System updates the password hash and invalidates all existing sessions
9. User is signed in and redirected to their dashboard

## Alternate Flows

### Email not registered
- At step 3: system shows the same success message as a registered email (prevents account enumeration) but sends no email

### Token expired
- At step 6: system shows "This link has expired" and offers to request a new one

### Token already used
- At step 6: system shows "This link has already been used" and offers a new reset request

## Postconditions
- The user's password has been updated
- All previous sessions for the account are invalidated
- The user has an active authenticated session with the new password

## Acceptance Criteria

**AC-1: Registered user receives a reset email**
- Given a user enters an email address that matches a registered account
- When they submit the forgot-password form
- Then they receive a reset email within 60 seconds containing a single-use link

**AC-2: Unregistered email shows no indication of non-existence**
- Given a user enters an email address with no registered account
- When they submit the forgot-password form
- Then they see the same success message as a registered email (no enumeration)

**AC-3: Valid token allows password update**
- Given a user clicks an unexpired, unused reset link
- When they enter and confirm a new password that meets strength requirements
- Then their password is updated, existing sessions are invalidated, and they are signed in

**AC-4: Expired token is rejected with a recovery path**
- Given a user clicks a reset link that has expired
- When the system processes the link
- Then they see an expiry message and a button to request a new reset email

## Status
- **State:** specified
- **Created:** 2026-03-25
