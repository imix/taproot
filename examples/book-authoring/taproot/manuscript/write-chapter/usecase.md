# Behaviour: Write Chapter

## Actor
Author — the person responsible for producing the manuscript content.

## Preconditions
- The chapter exists as a folder in the hierarchy with a `usecase.md` describing its scope and purpose
- The author has the research and notes needed to write the chapter

## Main Flow
1. Author opens the chapter's folder and reviews the scope defined in `usecase.md`
2. Author writes a first draft of the chapter content
3. Author saves the draft as the chapter's primary source file (e.g. `chapter.md`)
4. Author updates the chapter status to `draft` in `usecase.md`
5. Author commits the draft with the chapter's taproot tag
6. Author notifies the editor (or moves to self-review) that the draft is ready

## Alternate Flows

### Revision after editorial review
- **Trigger:** Editor has returned the chapter with comments or change requests
- **Steps:**
  1. Author reviews editorial comments in the chapter's `usecase.md` notes section
  2. Author revises the chapter content addressing the comments
  3. Author updates the chapter status to `revised`
  4. Author commits the revision

### Structural rewrite
- **Trigger:** Author realises the chapter needs significant restructuring
- **Steps:**
  1. Author updates `usecase.md` to reflect the new structure before rewriting
  2. Author rewrites the chapter content
  3. Author marks the chapter back to `draft` until reviewed

## Postconditions
- A chapter draft exists as a committed file in the repository
- The chapter status in `usecase.md` reflects the current state (`draft` or `revised`)
- The chapter is ready for editorial review

## Acceptance Criteria

**AC-1: Author can produce and commit a chapter draft**
- Given an author with a chapter folder containing a scoped `usecase.md`
- When they write the chapter content and commit it
- Then the draft exists in the repository and the chapter status is `draft`

**AC-2: Revision cycle updates status correctly**
- Given a chapter returned from editorial review with comments
- When the author revises the content and commits
- Then the chapter status is updated to `revised`

## Status
- **State:** specified
- **Created:** 2026-03-25
