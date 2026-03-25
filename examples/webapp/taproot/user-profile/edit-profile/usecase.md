# Behaviour: Edit Profile

## Actor
Authenticated user — a signed-in person who wants to update their profile information.

## Preconditions
- The user is authenticated
- The user is on their profile page or a dedicated edit-profile page

## Main Flow
1. User enters edit mode (clicks "Edit profile" or navigates to edit URL)
2. System renders an editable form pre-filled with the user's current values
3. User updates one or more fields (display name, avatar, preferences)
4. User submits the form
5. System validates the updated values
6. System persists the changes
7. System confirms success and returns the user to their profile view with updated values visible

## Alternate Flows

### Avatar upload
- At step 3: user selects an image file; system validates format (JPEG/PNG/WebP) and size (≤ 5 MB), generates a resized version, and stores it

### Validation failure
- At step 5: system shows inline errors (e.g. "Display name cannot be empty") without losing the user's other edits

### Email change (if supported)
- Changing email requires re-verification — system sends a confirmation to the new address before updating

## Postconditions
- The user's profile reflects the updated values
- Changes are immediately visible on their profile and anywhere the display name or avatar appears in the app

## Acceptance Criteria

**AC-1: User can update their display name**
- Given an authenticated user on the edit-profile form
- When they change their display name and submit
- Then the new name is saved and shown immediately on their profile page

**AC-2: Empty display name is rejected**
- Given an authenticated user who clears their display name field
- When they submit the form
- Then they see an inline validation error and the form is not submitted

**AC-3: User can upload a valid avatar image**
- Given an authenticated user who selects a JPEG or PNG file under 5 MB
- When they submit the form
- Then the new avatar is stored and displayed on their profile

**AC-4: Oversized or invalid image is rejected**
- Given a user who selects a file that exceeds 5 MB or is not an accepted image format
- When they attempt to submit
- Then they see an error message specifying the constraint that was violated

## Status
- **State:** specified
- **Created:** 2026-03-25
