# Behaviour: Prepare Submission

## Actor
Author — preparing the final manuscript package for a specific publisher or distribution channel.

## Preconditions
- All chapters in the manuscript are in `approved` state
- The author knows the target publisher's submission requirements (format, word count, metadata)

## Main Flow
1. Author reviews the publisher's submission guidelines
2. Author compiles all approved chapters into a single manuscript document
3. Author formats the document according to the publisher's requirements (font, spacing, margins, headers)
4. Author writes or updates the supporting materials: synopsis, query letter, author bio
5. Author exports the manuscript in the required format (PDF, DOCX, or submission portal upload)
6. Author commits the final submission package with all supporting materials
7. Author records the submission date and publisher details in this `usecase.md` notes section

## Alternate Flows

### Publisher requires revisions after submission
- **Trigger:** Publisher requests changes before accepting the manuscript
- **Steps:**
  1. Author records the revision requests in this `usecase.md`
  2. Author returns to the relevant chapters and sets their status back to `needs-revision`
  3. After revisions are approved, author prepares a new submission package

## Postconditions
- A complete submission package exists as a committed set of files
- Submission metadata (publisher, date, format) is recorded
- The manuscript is ready to submit or has been submitted

## Acceptance Criteria

**AC-1: Author can compile and commit a complete submission package**
- Given all chapters are in `approved` state
- When the author compiles, formats, and commits the submission package
- Then a versioned submission package exists with all required materials

**AC-2: Revision request restores chapter workflow**
- Given a publisher has requested revisions after submission
- When the author records the request and resets the affected chapters to `needs-revision`
- Then the editorial review workflow restarts for the affected chapters

## Status
- **State:** specified
- **Created:** 2026-03-25
