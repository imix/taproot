# UseCase: User Login

## Actor
Registered user

## Preconditions
- User has a verified account

## Main Flow
1. User enters email and password
2. System validates credentials
3. System creates a session token
4. User is redirected to dashboard

## Alternate Flows
- **Invalid credentials**: show error, do not reveal which field is wrong

## Error Conditions
- **Account locked**: inform user and link to unlock flow

## Postconditions
- User has an active session

## Status
- **State:** specified
- **Created:** 2026-01-01
