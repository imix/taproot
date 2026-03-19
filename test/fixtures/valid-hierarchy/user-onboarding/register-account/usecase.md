# Behaviour: Register Account

## Actor
New user visiting the application for the first time

## Preconditions
- User has a valid email address
- User has not previously registered

## Main Flow
1. User navigates to the registration page
2. User enters email and password
3. System validates the input
4. System creates the account and sends a verification email
5. User is redirected to the "check your email" page

## Alternate Flows
### Existing Email
- **Trigger:** Email already exists in the system
- **Steps:**
  1. System shows "account already exists" message
  2. System offers a link to login or reset password

## Postconditions
- User account is created in pending verification state
- Verification email is sent to the provided address

## Error Conditions
- Invalid email format: Show inline validation error
- Password too weak: Show password requirements

## Status
- **State:** implemented
- **Created:** 2024-01-16
- **Last reviewed:** 2024-03-01

## Notes
Password requirements defined in password-policy behaviour.
