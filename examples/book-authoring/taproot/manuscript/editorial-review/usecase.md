# Behaviour: Editorial Review

## Actor
Editor — a person reviewing a chapter draft for structure, clarity, and quality.

## Preconditions
- A chapter draft has been committed and its status is `draft` or `revised`
- The editor has access to the chapter content and its scope definition in `usecase.md`

## Main Flow
1. Editor reads the chapter's `usecase.md` to understand the intended scope
2. Editor reads the chapter draft
3. Editor evaluates the chapter against the scope: structure, argument flow, clarity, and consistency with other chapters
4. Editor records feedback in the chapter's `usecase.md` notes section
5. Editor updates the chapter status to `in-review` while reviewing, then to `needs-revision` or `approved`
6. Editor notifies the author of the outcome

## Alternate Flows

### Chapter approved without changes
- **Trigger:** Editor finds no significant issues
- **Steps:**
  1. Editor updates chapter status to `approved`
  2. Editor records a brief approval note in `usecase.md`

### Chapter requires major structural changes
- **Trigger:** Chapter does not align with the intended scope or book structure
- **Steps:**
  1. Editor updates chapter status to `needs-revision`
  2. Editor documents specific structural concerns and recommendations
  3. Editor may update the chapter's `usecase.md` scope if the requirements themselves need revision

## Postconditions
- The chapter status reflects the editorial outcome (`approved` or `needs-revision`)
- Feedback is recorded in the chapter's `usecase.md` for the author to act on

## Acceptance Criteria

**AC-1: Editor can record a review and update chapter status**
- Given a chapter in `draft` state
- When the editor reviews it and records feedback
- Then the chapter status is updated to `approved` or `needs-revision` and the feedback is committed

**AC-2: Approved chapter is marked and ready for publication**
- Given an editor who finds no issues with a chapter
- When they approve it
- Then the chapter status is `approved` and no further review is required before that chapter proceeds to publishing

## Status
- **State:** specified
- **Created:** 2026-03-25
