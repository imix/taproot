# Behaviour: View Profile

## Actor
Authenticated user — a signed-in person viewing their own profile page.

## Preconditions
- The user is authenticated
- The user has an existing account with at least an email address on record

## Main Flow
1. User navigates to their profile page (e.g. via avatar menu → "Profile")
2. System retrieves the user's current profile data
3. System renders the profile page showing: display name, email address, avatar, account creation date, and any editable preferences
4. User can see all their stored information in one place

## Postconditions
- No data is modified
- The user has an accurate view of their current stored profile

## Acceptance Criteria

**AC-1: Authenticated user can view their own profile**
- Given an authenticated user
- When they navigate to their profile page
- Then they see their display name, email address, avatar, and account creation date

**AC-2: Unauthenticated access is redirected to sign-in**
- Given an unauthenticated visitor who navigates to the profile URL directly
- When the page loads
- Then they are redirected to the sign-in page with a return URL set

**AC-3: User cannot access another user's profile page**
- Given an authenticated user who requests the profile URL of a different user
- When the page loads
- Then they receive a 403 or are redirected to their own profile

## Status
- **State:** specified
- **Created:** 2026-03-25
